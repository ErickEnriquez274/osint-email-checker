import axios from "axios";
import { EmailRepResponse } from "../types/email.types";

export const checkEmailRep = async (email: string): Promise<EmailRepResponse | null> => {
  try {
    const response = await axios.get<EmailRepResponse>(
      `https://emailrep.io/${encodeURIComponent(email)}`,
      {
        timeout: 8000,
        headers: { "User-Agent": "osint-school-project" }
      }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 429) throw new Error("Límite de consultas alcanzado, intenta más tarde");
    return null;
  }
};