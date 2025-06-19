let questions = []; // { id, text, likes, status: 'pending' | 'approved' }

let questionsBySession = {};
let sessionNames = {};   // {sessionId: "sessionName" }

function addQuestion(text, sessionId) {
  questionArray = questionsBySession[sessionId];
  const q = { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), text, likes: 0, status: 'pending' };
  questionArray.push(q);
  return q;
}

function getQuestions(filter = {}, sessionId) {
  questionArray = questionsBySession[sessionId];
  return questionArray.filter(q => {
    return (!filter.status || q.status === filter.status);
  });
}

function likeQuestion(id, sessionId) {
  questionArray = questionsBySession[sessionId];
  const q = questionArray.find(q => q.id === id && q.status === 'approved');
  if (q) q.likes++;
  return q;
}

function approveQuestion(id, sessionId) {
  questionArray = questionsBySession[sessionId];
  const q = questionArray.find(q => q.id === id && q.status === 'pending');
  if (q) q.status = 'approved';
  return q;
}

function deleteQuestion(id, sessionId) {
  questionArray = questionsBySession[sessionId];
  const index = questionArray.findIndex(q => q.id === id);
  if (index !== -1) questionArray.splice(index, 1);
}

function createSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function createSession(sessionId, sessionName) {
  sessionNames[sessionId] = sessionName;
  if (!questionsBySession[sessionId]) {
    questionsBySession[sessionId] = [];
  }
}

function getSessionName(sessionId) {
  return sessionNames[sessionId] || "Unknown Session";
}

function getAllSessions() {
  return Object.keys(questionsBySession).map(sessionId => ({
    id: sessionId,
    name: getSessionName(sessionId),
  }));
}

function removeSession(sessionId) {
  delete questionsBySession[sessionId];
  delete sessionNames[sessionId];
}

module.exports = {
  addQuestion,
  getQuestions,
  likeQuestion,
  approveQuestion,
  deleteQuestion,
  createSessionId,
  createSession,
  getAllSessions,
  removeSession
};
