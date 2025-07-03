// Utility for interacting with sessionStorage in a clean, reusable way

export const setSessionItem = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error setting sessionStorage[${key}]`, err);
  }
};

export const getSessionItem = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (err) {
    console.error(`Error parsing sessionStorage[${key}]`, err);
    return defaultValue;
  }
};

export const removeSessionItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (err) {
    console.error(`Error removing sessionStorage[${key}]`, err);
  }
};

export const clearSession = () => {
  sessionStorage.clear();
};
