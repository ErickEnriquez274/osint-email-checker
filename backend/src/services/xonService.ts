import axios from "axios";
import { XONResponse } from "../types/email.types";

export const checkXON = async (email: string): Promise<XONResponse | null> => {
  try {
    const response = await axios.get<XONResponse>(
      `https://api.xposedornot.com/v1/check-email/${encodeURIComponent(email)}`,
      { timeout: 8000 }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null; // correo no encontrado = sin filtraciones
    throw new Error("XposedOrNot no respondió correctamente");
  }
};