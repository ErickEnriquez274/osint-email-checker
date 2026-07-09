import { Request, Response } from "express";
import { checkXON } from "../services/xonService";
import { checkEmailRep } from "../services/emailRepService";
import { checkGravatar } from "../services/gravatarService";
import { calculateRiskScore } from "../services/riskScore";
import { checkHolehe } from "../services/holeheService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const checkEmail = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email || !emailRegex.test(email)) {
    res.status(400).json({ error: "Ingresa un correo electrónico válido" });
    return;
  }

  try {
    const [breaches, reputation, gravatar] = await Promise.allSettled([
      checkXON(email),
      checkEmailRep(email),
      checkGravatar(email),
    ]);

    const breachesValue = breaches.status === "fulfilled" ? breaches.value : null;
    const reputationValue = reputation.status === "fulfilled" ? reputation.value : null;
    const gravatarValue = gravatar.status === "fulfilled" ? gravatar.value : null;

    const risk = calculateRiskScore({
      breaches: breachesValue,
      reputation: reputationValue,
    });

    res.json({
      email,
      breaches: breaches.status === "fulfilled" ? breaches.value : null,
      reputation: reputation.status === "fulfilled" ? reputation.value : null,
      gravatar: gravatar.status === "fulfilled" ? gravatar.value : null,
      risk,
      checkedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
};