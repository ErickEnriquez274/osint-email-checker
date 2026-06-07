import { User } from "../types/email.types";

// Cuando conectes MySQL, este array se reemplaza por queries a la DB
const users: User[] = [];

export const findUserByEmail = (email: string) =>
  users.find(u => u.email === email) || null;

export const findUserById = (id: string) =>
  users.find(u => u.id === id) || null;

export const createUser = (user: User) => {
  users.push(user);
  return user;
};