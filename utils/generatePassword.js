module.exports = function generateRandomPassword() {
  return Math.random().toString(36).slice(-10); // ex: abcd1234xy
};
