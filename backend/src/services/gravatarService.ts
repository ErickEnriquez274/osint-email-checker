import axios from "axios";
import crypto from "crypto";
import { GravatarResponse } from "../types/email.types";

export const checkGravatar = async (email: string): Promise<GravatarResponse | null> => {
  try {
    const hash = crypto.createHash("md5").update(email.trim().toLowerCase()).digest("hex");
    const response = await axios.get<GravatarResponse>(
      `https://www.gravatar.com/${hash}.json`,
      { timeout: 5000 }
    );
    return response.data;
  } catch {
    return null; // Si no tiene Gravatar simplemente retorna null, no es un error
  }
};