import dotenv from 'dotenv';

dotenv.config();

const PORT = Number(process.env.PORT) || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';

export const env = {
  port: PORT,
  jwtSecret: JWT_SECRET,
  databaseUrl: DATABASE_URL,
  clientOrigin: CLIENT_ORIGIN,
  uploadDir: UPLOAD_DIR,
};

