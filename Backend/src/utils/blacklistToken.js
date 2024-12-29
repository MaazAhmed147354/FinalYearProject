const blackList = new Set();

const addToBlacklist = (token) => {
  blackList.add(token);
};

const isTokenBlacklisted = (token) => {
  return blackList.has(token);
};

module.exports = { addToBlacklist, isTokenBlacklisted };