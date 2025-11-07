/**
 * Application configuration
 */
export const config = {
  // Backend API URL - defaults to localhost:3001 for development
  // In production, this should be set via environment variable
  backendUrl: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001',
};
