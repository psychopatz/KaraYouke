// src/utils/userUtils.js

// A default user object to return when a user can't be found.
// This prevents the UI from crashing if a user leaves the session.
const defaultUser = {
  id: 'unknown-user',
  name: 'A former user',
  avatarBase64: '/Avatars/1.svg' // A safe default avatar
};

/**
 * Finds a user's data from an array of users based on their ID.
 * @param {string} userId - The ID of the user to find.
 * @param {Array<object>} users - The array of all connected user objects.
 * @returns {object} The full user object or a default object if not found.
 */
export const getUserData = (userId, users) => {
  if (!userId || !users || users.length === 0) {
    return defaultUser;
  }
  const foundUser = users.find(user => user.id === userId);
  return foundUser || defaultUser;
};