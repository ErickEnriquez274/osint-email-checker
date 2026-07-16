import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../store/userStore";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

export const registerUser = async (email: string, password: string, username: string) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new Error("El correo ya está registrado");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser({ email, passwordHash, username });

  const token = jwt.sign(
    { userId: user.id, email: user.email, username: user.username },
    JWT_SECRET
  );

  return { token, email: user.email, username: user.username };
};

export const loginUser = async (email: string, password: string) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Credenciales incorrectas");

  const valid = await bcrypt.compare(password, user.contrasena);
  if (!valid) throw new Error("Credenciales incorrectas");

  const token = jwt.sign(
    { userId: user.id.toString(), email: user.correo, username: user.nombre_usuario },
    JWT_SECRET
  );

  return { token, email: user.correo, username: user.nombre_usuario };
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as any;
};