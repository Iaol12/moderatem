const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require('path');
const {
  addQuestion,
  getQuestions,
  likeQuestion,
  approveQuestion,
  deleteQuestion
} = require("./questions");
const { authenticate } = require("./auth");

const port = process.env.PORT || 4000 
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Map(); // socket => { screenType, isModerator }

function sendData(ws, type, data) {
  ws.send(JSON.stringify({ type, data }));
}

function broadcast(filterFn, type, data) {
  for (const [client, meta] of clients.entries()) {
    if (client.readyState === WebSocket.OPEN && filterFn(meta)) {
      sendData(client, type, data);
    }
  }
}

function updateClients() {
  const approved = getQuestions({ status: 'approved' });
  const pending = getQuestions({ status: 'pending' });

  broadcast(meta => meta.screenType === 'submit' || meta.screenType === 'display', 'approved', approved);
  broadcast(meta => meta.screenType === 'moderation', 'moderation', { approved, pending });
}

wss.on("connection", (ws) => {
  console.log("[WebSocket] New connection");
  clients.set(ws, { screenType: null, isModerator: false });

  ws.on("message", (msg) => {
    try {
      const { type, data } = JSON.parse(msg);
      const meta = clients.get(ws);
      console.log(`[WebSocket] Message received: type=${type}`, data);

      switch (type) {
        case "register-screen":
          meta.screenType = data.screen;
          if (data.token && authenticate(data.token)) {
            meta.isModerator = true;
          }
          updateClients();
          break;

        case "submit-question":
          if (meta.screenType === "submit" && typeof data.text === "string") {
            addQuestion(data.text);
            updateClients();
          }
          break;

        case "like-question":
          if (meta.screenType === "submit") {
            likeQuestion(data.id);
            updateClients();
          }
          break;

        case "approve-question":
          if (meta.isModerator) {
            approveQuestion(data.id);
            updateClients();
          }
          break;

        case "delete-question":
          if (meta.isModerator) {
            deleteQuestion(data.id);
            updateClients();
          }
          break;

        default:
          break;
      }
    } catch (e) {
      console.error("Message handling error:", e);
    }
  });

  ws.on("close", () => {
    console.log("[WebSocket] Connection closed");
    clients.delete(ws);
  });

  ws.on("error", (err) => {
    console.error("[WebSocket] Error:", err);
  });
});

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all: serve index.html for React Router (avoid path-to-regexp error)
app.use((req, res, next) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
