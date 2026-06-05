import { parsePhoneNumber, isValidPhoneNumber } from "libphonenumber-js";
import axios from "axios";
import { PhoneMetadata } from "../types/email.types";

export const getPhoneMetadata = (phone: string): PhoneMetadata => {
  try {
    const parsed = parsePhoneNumber(phone);
    return {
      valid: isValidPhoneNumber(phone),
      country: parsed.country,
      countryCallingCode: parsed.countryCallingCode,
      nationalNumber: parsed.nationalNumber,
      numberType: parsed.getType(),
      formatted: parsed.formatInternational(),
    };
  } catch {
    return {
      valid: false,
      country: undefined,
      countryCallingCode: "",
      nationalNumber: "",
      numberType: undefined,
      formatted: phone,
    };
  }
};

export const checkPhoneBreaches = async (phone: string): Promise<any | null> => {
  try {
    // XposedOrNot tiene un endpoint separado para teléfonos
    const encoded = encodeURIComponent(phone);
    const response = await axios.get(
      `https://api.xposedornot.com/v1/phone-check/${encoded}`,
      { timeout: 8000 }
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) return null; // sin filtraciones
    if (error.response?.status === 400) return null; // número no reconocido
    return null; // cualquier otro error, no bloqueamos el resultado
  }
};