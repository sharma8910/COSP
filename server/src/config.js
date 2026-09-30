import 'dotenv/config';

const required = ['MONGODB_URI', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}

export const config = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  cookieName: process.env.COOKIE_NAME || 'child_safety_session',
  isProduction: process.env.NODE_ENV === 'production',
  redisUrl: process.env.REDIS_URL,
};
