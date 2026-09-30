import express from 'express';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import authRoutes from './routes/auth.js';
import childrenRoutes from './routes/children.js';
import policiesRoutes from './routes/policies.js';
import activityRoutes from './routes/activity.js';
import './redis.js';
import cors from 'cors';

import dns from "dns";
dns.setServers(["8.8.8.8"]);

const app = express();
app.disable('x-powered-by');
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials : true
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30 }), authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/policies', policiesRoutes);
app.use('/api/activity', activityRoutes);
app.use('/health', (request, response) => response.json({ message: 'Child Safety API is running' }));
app.use((error, request, response, next) => {
  console.error(error);
  response.status(500).json({ error: 'Internal server error' });
});

await mongoose.connect(config.mongoUri);
app.listen(config.port, () => console.log(`Child Safety API listening on port ${config.port}`));
