import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { generateToken } from '../middleware/auth.js';

const router = Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin.id);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ 
      success: true, 
      admin: { id: admin.id, email: admin.email, name: admin.name } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// Register - DISABLED for security
router.post('/register', async (_req, res) => {
  return res.status(403).json({ error: 'Registration is disabled' });
});

// Check auth status
router.get('/me', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.json({ authenticated: false });
  }

  try {
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-super-secret-key-change-in-production') as { adminId: string };
    
    const admin = await prisma.admin.findUnique({ 
      where: { id: decoded.adminId },
      select: { id: true, email: true, name: true }
    });

    if (!admin) {
      return res.json({ authenticated: false });
    }

    res.json({ authenticated: true, admin });
  } catch {
    res.json({ authenticated: false });
  }
});

export default router;
