import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import authRoutes from './routes/auth';
import generationRoutes from './routes/generations';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve(env.uploadDir)));

app.use('/auth', authRoutes);
app.use('/generations', generationRoutes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use(errorHandler);

export default app;

