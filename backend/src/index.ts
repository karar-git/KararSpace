import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:3000',
  'http://localhost:4321', // Astro dev
  'http://localhost:5173', // Vite dev (admin)
  'http://localhost:5174',
].filter(Boolean) as string[];

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed.includes(origin.replace(/https?:\/\//, '')))) {
      return callback(null, true);
    }
    
    // In production, also allow Vercel preview deployments
    if (origin.includes('vercel.app') || origin.includes('railway.app')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
