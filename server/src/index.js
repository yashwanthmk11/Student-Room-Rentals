import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import listingRoutes from './routes/listings.js';
import matchingRoutes from './routes/matching.js';
import ownerRoutes from './routes/owner.js';
import ownerQuestionsRoutes from './routes/ownerQuestions.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Allow any localhost port during development so Vite can pick any free one
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || origin.startsWith('http://localhost')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));

// Serve uploaded media files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Student Rentals API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/owner/questions', ownerQuestionsRoutes);

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/student_rentals';
const PORT = process.env.PORT || 4000;

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`API server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

