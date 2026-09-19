import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';

import authRoutes from './src/routes/auth.js';
import filesRoutes from './src/routes/files.js';
import parseRoutes from './src/routes/parse.js';
import adminRoutes from './src/routes/admin.js';
import aiRoutes from './src/routes/ai.js';
import historyRoutes from './src/routes/history.js';

import { errorHandler } from './src/middleware/errorHandler.js';
import connectDB from './src/config/db.js';

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error(' JWT_SECRET missing in .env');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(',') || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,   // COEP off — images ke liye zaroori
  })
)
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' })); 

app.use(
  '/uploads',
  express.static(path.resolve('uploads'), {
    crossOriginResourcePolicy: { policy: 'cross-origin' },  // ✅
  })
)

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/data', parseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/history', historyRoutes); 

app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date().toISOString() }));

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));

app.use(errorHandler);

connectDB();
app.listen(PORT, () => console.log(` Server running on port ${PORT}`));