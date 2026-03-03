import { createApp } from './app';
import { checkEnvironmentVariables } from './config/env-check';

// Check environment variables before starting server
checkEnvironmentVariables();

const PORT = process.env.PORT || 3000;

const app = createApp();

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`OMS API listening on port ${PORT}`);
});
