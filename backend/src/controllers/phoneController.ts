import { Request, Response } from "express";
import { getPhoneMetadata, checkPhoneBreaches } from "../services/phoneService";
import { calculateRiskScore } from "../services/riskScore";
export const checkPhone = async (req: Request, res: Response) => {
  const { phone } = req.body;

  if (!phone || typeof phone !== "string") {
    res.status(400).json({ error: "Ingresa un número de teléfono válido" });
    return;
  }

  // El número debe venir con código de país: +52, +1, etc.
  if (!phone.startsWith("+")) {
    res.status(400).json({ error: "El número debe incluir el código de país (ej: +521234567890)" });
    return;
  }

  const metadata = getPhoneMetadata(phone);

  if (!metadata.valid) {
    res.status(400).json({ error: "Número de teléfono inválido" });
    return;
  }

  try {
    const breaches = await checkPhoneBreaches(phone);
    const risk = calculateRiskScore({
  breaches,
  numberType: metadata.numberType,
  country: metadata.country,
});
    res.json({
      phone,
      metadata,
      breaches,
      risk,
      checkedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error interno" });
  }
};