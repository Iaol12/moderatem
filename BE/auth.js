const MODERATOR_TOKEN = "supersecret";

function authenticate(token) {
  return token === MODERATOR_TOKEN;
}

module.exports = { authenticate };
