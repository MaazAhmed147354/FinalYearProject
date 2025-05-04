const blacklist = new Set();

// Add token to blacklist
const addToBlacklist = (token) => {
  blacklist.add(token);
};

// Check if token is blacklisted
const isTokenBlacklisted = (token) => {
  return blacklist.has(token);
};

// (Optional) Remove token from blacklist
const removeFromBlacklist = (token) => {
  blacklist.delete(token);
};

// (Optional) Clear all tokens from blacklist
const clearBlacklist = () => {
  blacklist.clear();
};

module.exports = {
  addToBlacklist,
  isTokenBlacklisted,
  removeFromBlacklist,
  clearBlacklist,
};
