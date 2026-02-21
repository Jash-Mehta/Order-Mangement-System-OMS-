import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Required environment variables
const requiredEnvVars = [
  'JWT_SECRET'
];

// Optional environment variables with defaults
const optionalEnvVars = {
  'NODE_ENV': 'development',
  'PORT': '3000',
  'ALLOWED_ORIGINS': 'http://localhost:3000,http://localhost:3001',
  'DATABASE_URL': 'postgresql://localhost:5432/oms_database'
};

export function checkEnvironmentVariables(): void {
  const missingVars: string[] = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  // Set optional variables with defaults
  for (const [key, defaultValue] of Object.entries(optionalEnvVars)) {
    if (!process.env[key]) {
      process.env[key] = defaultValue;
      console.log(`⚠️  Using default for ${key}: ${defaultValue}`);
    }
  }

  // If any required variables are missing, show helpful error
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   - ${varName}`);
    });
    
    console.error('\n🔧 To fix this:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Update .env with your values');
    console.error('3. Make sure JWT_SECRET is set to a strong secret key');
    
    console.error('\n📝 Example .env file:');
    console.error('JWT_SECRET=your-super-secret-jwt-key-change-this-in-production');
    console.error('# DATABASE_URL=postgresql://username:password@localhost:5432/oms_database');
    
    process.exit(1);
  }

  console.log('✅ Environment variables validated');
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
}
