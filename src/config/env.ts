// Environment variables with type safety
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Validate required environment variables
const requiredEnvVars = ['VITE_API_BASE_URL'] as const;

requiredEnvVars.forEach((envVar) => {
  if (!import.meta.env[envVar]) {
    console.warn(`Missing environment variable: ${envVar}`);
  }
});

