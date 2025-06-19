const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const path = require('path');
const {
  addQuestion,
  getQuestions,
  likeQuestion,
  approveQuestion,
  deleteQuestion,
  getAllSessions,
  createSession,
  createSessionId,
  removeSession
} = require("./questions");
const { authenticate } = require("./auth");

const staticPath = path.join(__dirname, './build');
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

function updateClients(sessionId) {
  const approved = getQuestions({ status: 'approved' }, sessionId);
  const pending = getQuestions({ status: 'pending' }, sessionId);

  broadcast(
    meta => meta.session_id === sessionId && (meta.screenType === 'submit' || meta.screenType === 'display'),
    'approved',
    approved
  );
  broadcast(
    meta => meta.session_id === sessionId && meta.screenType === 'moderation',
    'moderation',
    { approved, pending }
  );
}

wss.on("connection", (ws) => {
  console.log("[WebSocket] New connection");
  clients.set(ws, { screenType: null, isModerator: false, session_id: null });

  ws.on("message", (msg) => {
    try {
      const { type, data } = JSON.parse(msg);
      const meta = clients.get(ws);

      switch (type) {
        case "register-screen":
          meta.screenType = data.screen;
          meta.session_id = data.session_id || null; // Store session_id if provided
          if (data.token && authenticate(data.token)) {
            meta.isModerator = true;
          }
          updateClients(meta.session_id);
          break;

        case "submit-question":
          if (meta.screenType === "submit" && typeof data.text === "string") {
            addQuestion(data.text, meta.session_id);
            updateClients(meta.session_id);
          }
          break;

        case "like-question":
          if (meta.screenType === "submit") {
            likeQuestion(data.id, meta.session_id);
            updateClients(meta.session_id);
          }
          break;
        case "unlike-question":
          if (meta.screenType === "submit") {
            // Implement unlike logic
            if (typeof data.id !== 'undefined') {
              const questions = getQuestions({ status: 'approved' }, meta.session_id);
              const q = questions.find(q => q.id === data.id);
              if (q && q.likes > 0) {
                q.likes -= 1;
                updateClients(meta.session_id);
              }
            }
          }
          break;

        case "approve-question":
          if (meta.isModerator) {
            approveQuestion(data.id, meta.session_id);
            updateClients(meta.session_id);
          }
          break;

        case "delete-question":
          if (meta.isModerator) {
            deleteQuestion(data.id, meta.session_id);
            updateClients(meta.session_id);
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

app.use(express.json());

app.post('/sessions', (req, res) => {
  const { sessionName, token } = req.body;
  if (token && !authenticate(token)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  if (!sessionName) {
    return res.status(400).json({ error: "Session name is required" });
  }
  const sessionId = createSessionId();
  createSession(sessionId, sessionName);
  res.json({ id: sessionId, name: sessionName });
});

// Remove a session
app.delete('/sessions/:id', (req, res) => {
  const token = req.body.token;
  if (token && !authenticate(token)) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  const sessionId = req.params.id;
  removeSession(sessionId);
  res.json({ success: true });
});


app.get('/sessions', (req, res) => {
  const sessions = getAllSessions();
  res.json(sessions);
});


app.post('/authentificate', (req, res) => {
  const password = req.body.password;
  if (password && authenticate(password)) {
    res.json({ success: true });
  } else {
    res.status(403).json({ success: false, error: "Unauthorized" });
  }
});

// Serve static files from React build
app.use(express.static(staticPath));

// Catch-all: serve index.html for React Router (avoid path-to-regexp error)
app.use((req, res, next) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
