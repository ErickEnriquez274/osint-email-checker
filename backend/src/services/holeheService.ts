import axios from "axios";

export interface HoleheSite {
  site: string;
  domain: string;
  exists: boolean;
}

// Esta versión ya no se usa para streaming, pero la dejamos para compatibilidad
export const checkHolehe = async (email: string): Promise<HoleheSite[]> => {
  try {
    const response = await axios.get(
      `${process.env.HOLEHE_URL || 'http://localhost:5000'}/check?email=${encodeURIComponent(email)}`,
      { timeout: 120000 }
    );
    return response.data.sites || [];
  } catch {
    return [];
  }
};