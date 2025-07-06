import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execSync } from 'child_process' // Import Node.js module to run shell commands

// Function to get the current git commit hash reliably
const getGitCommitHash = () => {
  try {
    // 1. Check for Vercel's environment variable (used in production)
    if (process.env.VERCEL_GIT_COMMIT_SHA) {
      return process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7);
    }
    // 2. Check for Render's environment variable (used in production)
    if (process.env.RENDER_GIT_COMMIT) {
      return process.env.RENDER_GIT_COMMIT.slice(0, 7);
    }
    // 3. Fallback for local development: run the git command
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch (e) {
    // Fallback if git is not available or it's not a git repo
    console.error('Failed to get git commit hash:', e);
    return 'unknown';
  }
};

const appVersion = getGitCommitHash();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Exposes the server to the LAN
    port: 5173,      // Optional: Change the port if necessary
  },
  // --- ADD THIS SECTION ---
  // This makes the version available in your React code
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion)
  }
})