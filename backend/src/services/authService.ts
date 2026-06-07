import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { findUserByEmail, createUser } from "../store/userStore";
import { AuthPayload } from "../types/email.types";

// Instala uuid: npm install uuid && npm install -D @types/uuid

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const registerUser = async (email: string, password: string) => {
  if (findUserByEmail(email)) {
    throw new Error("El correo ya está registrado");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = createUser({
    id: uuidv4(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email } as AuthPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, email: user.email };
};

export const loginUser = async (email: string, password: string) => {
  const user = findUserByEmail(email);

  if (!user) throw new Error("Credenciales incorrectas");

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Credenciales incorrectas");

  const token = jwt.sign(
    { userId: user.id, email: user.email } as AuthPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { token, email: user.email };
};

export const verifyToken = (token: string): AuthPayload => {
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};