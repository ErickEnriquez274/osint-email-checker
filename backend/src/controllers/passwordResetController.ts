import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import pool from "../db/connection";
import { sendPasswordResetEmail } from "../services/emailService";

export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Correo requerido" });
    return;
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT id FROM usuarios WHERE correo = ?",
      [email]
    );

    // Siempre responde igual para no revelar si el correo existe
    if (rows.length === 0) {
      res.json({ message: "Si el correo existe recibirás un enlace en breve" });
      return;
    }

    const userId = rows[0].id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    // Borra tokens anteriores del mismo usuario
    await pool.execute(
      "DELETE FROM recuperacion_contrasena WHERE usuario_id = ?",
      [userId]
    );

    // Guarda el nuevo token
    await pool.execute(
      "INSERT INTO recuperacion_contrasena (usuario_id, token, expira_en) VALUES (?, ?, ?)",
      [userId, token, expiresAt]
    );

    await sendPasswordResetEmail(email, token);

    res.json({ message: "Si el correo existe recibirás un enlace en breve" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = req.body;

  if (!token || !password || password.length < 8) {
    res.status(400).json({ error: "Token y contraseña válida requeridos" });
    return;
  }

  try {
    const [rows]: any = await pool.execute(
      "SELECT * FROM recuperacion_contrasena WHERE token = ? AND expira_en > NOW()",
      [token]
    );

    if (rows.length === 0) {
      res.status(400).json({ error: "Token inválido o expirado" });
      return;
    }

    const userId = rows[0].usuario_id;
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.execute(
      "UPDATE usuarios SET contrasena = ? WHERE id = ?",
      [passwordHash, userId]
    );

    await pool.execute(
      "DELETE FROM recuperacion_contrasena WHERE token = ?",
      [token]
    );

    res.json({ message: "Contraseña actualizada correctamente" });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};