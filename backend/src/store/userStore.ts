import pool from "../db/connection";

export const findUserByEmail = async (email: string) => {
  const [rows]: any = await pool.execute(
    "SELECT * FROM usuarios WHERE correo = ?",
    [email]
  );
  return rows[0] || null;
};

export const findUserById = async (id: string) => {
  const [rows]: any = await pool.execute(
    "SELECT * FROM usuarios WHERE id = ?",
    [id]
  );
  return rows[0] || null;
};

export const createUser = async (user: { email: string; passwordHash: string; username: string }) => {
  const [result]: any = await pool.execute(
    "INSERT INTO usuarios (nombre_usuario, correo, contrasena) VALUES (?, ?, ?)",
    [user.username, user.email, user.passwordHash]
  );
  return {
    id: result.insertId.toString(),
    email: user.email,
    username: user.username,
    passwordHash: user.passwordHash,
    createdAt: new Date().toISOString(),
  };
};