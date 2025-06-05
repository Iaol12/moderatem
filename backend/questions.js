let questions = []; // { id, text, likes, status: 'pending' | 'approved' }

function addQuestion(text) {
  const q = { id: Date.now().toString(), text, likes: 0, status: 'pending' };
  questions.push(q);
  return q;
}

function getQuestions(filter = {}) {
  return questions.filter(q => {
    return (!filter.status || q.status === filter.status);
  });
}

function likeQuestion(id) {
  const q = questions.find(q => q.id === id && q.status === 'approved');
  if (q) q.likes++;
  return q;
}

function approveQuestion(id) {
  const q = questions.find(q => q.id === id && q.status === 'pending');
  if (q) q.status = 'approved';
  return q;
}

function deleteQuestion(id) {
  const index = questions.findIndex(q => q.id === id);
  if (index !== -1) questions.splice(index, 1);
}

module.exports = {
  addQuestion,
  getQuestions,
  likeQuestion,
  approveQuestion,
  deleteQuestion
};
