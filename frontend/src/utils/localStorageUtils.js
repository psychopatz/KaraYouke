// src/utils/localStorageUtils.js

// Utility for interacting with localStorage in a clean, reusable way

/**
 * Saves an item to localStorage after converting it to a JSON string.
 * @param {string} key The key to save the item under.
 * @param {any} value The value to save.
 */
export const setLocalItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting localStorage[${key}]`, err);
  }
};

/**
 * Retrieves an item from localStorage and parses it as JSON.
 * @param {string} key The key of the item to retrieve.
 * @param {any} defaultValue The value to return if the key doesn't exist.
 * @returns {any} The parsed item or the default value.
 */
export const getLocalItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error parsing localStorage[${key}]`, err);
    return defaultValue;
  }
};

/**
 * Removes an item from localStorage.
 * @param {string} key The key of the item to remove.
 */
export const removeLocalItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing localStorage[${key}]`, err);
  }
};