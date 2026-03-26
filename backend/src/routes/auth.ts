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

    // Set cookie for same-origin requests
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Also return token in response for cross-origin requests (admin dashboard on different domain)
    res.json({ 
      success: true, 
      token,
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

// One-time setup - creates admin account if none exists
// Visit: https://kararspace-production.up.railway.app/api/auth/setup
router.get('/setup', async (_req, res) => {
  try {
    // First, test database connection
    await prisma.$connect();
    console.log('Database connected successfully');

    const existingAdmin = await prisma.admin.findFirst();
    if (existingAdmin) {
      return res.send(`
        <h1>Admin already exists</h1>
        <p>Email: ${existingAdmin.email}</p>
        <p>Setup not needed.</p>
      `);
    }

    const hashedPassword = await bcrypt.hash('KararAdmin2024!', 12);
    const newAdmin = await prisma.admin.create({
      data: {
        email: 'addfgh177@gmail.com',
        password: hashedPassword,
        name: 'Karar',
      },
    });

    console.log('Admin created:', newAdmin.id);

    res.send(`
      <h1>Admin account created!</h1>
      <p>Email: addfgh177@gmail.com</p>
      <p>Password: KararAdmin2024!</p>
      <p>Admin ID: ${newAdmin.id}</p>
      <p><strong>Change your password after logging in!</strong></p>
      <p><a href="https://admin.kararspace.com">Go to Admin Dashboard</a></p>
    `);
  } catch (error: any) {
    console.error('Setup error:', error);
    res.status(500).send(`
      <h1>Setup failed</h1>
      <p>Error: ${error.message}</p>
      <p>Code: ${error.code || 'N/A'}</p>
      <pre>${JSON.stringify(error, null, 2)}</pre>
    `);
  }
});

// Debug endpoint - check database status
router.get('/debug', async (_req, res) => {
  try {
    await prisma.$connect();
    const adminCount = await prisma.admin.count();
    const admins = await prisma.admin.findMany({ select: { id: true, email: true, name: true } });
    
    res.json({
      connected: true,
      adminCount,
      admins,
      databaseUrl: process.env.DATABASE_URL ? 'Set (hidden)' : 'NOT SET',
      jwtSecret: process.env.JWT_SECRET ? 'Set' : 'NOT SET',
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message,
      code: error.code,
    });
  }
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
