// backend/src/routes/auth.ts
// Instala dependencias: npm install bcryptjs jsonwebtoken
// npm install -D @types/bcryptjs @types/jsonwebtoken

import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto_por_un_secreto_seguro';

// ── Usuarios de ejemplo (en producción usa una base de datos) ──
const USERS = [
  {
    id: 1,
    username: 'admin',
    // Contraseña: "admin123" hasheada
    passwordHash: bcrypt.hashSync('admin123', 10),
  },
];

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });
  }

  const user = USERS.find(u => u.username === username);
  if (!user) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Credenciales incorrectas' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  return res.json({ token });
});

export default router;

// ── En tu archivo principal del backend (e.g. app.ts o index.ts) agrega: ──
// import authRouter from './routes/auth';
// app.use('/api/auth', authRouter);