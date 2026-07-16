import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/authService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  if (!username || username.trim().length < 3) {
    res.status(400).json({ error: "El nombre de usuario debe tener al menos 3 caracteres" });
    return;
  }
  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: "Correo inválido" });
    return;
  }
  if (!password || password.length < 8) {
    res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres" });
    return;
  }

  try {
    const result = await registerUser(email, password, username);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Correo y contraseña requeridos" });
    return;
  }

  try {
    const result = await loginUser(email, password);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
};