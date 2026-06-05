import { Request, Response } from "express";
import { checkXON } from "../services/xonService";
import { checkEmailRep } from "../services/emailRepService";
import { checkGravatar } from "../services/gravatarService";

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

    res.json({
      email,
      breaches: breaches.status === "fulfilled" ? breaches.value : null,
      reputation: reputation.status === "fulfilled" ? reputation.value : null,
      gravatar: gravatar.status === "fulfilled" ? gravatar.value : null,
      checkedAt: new Date().toISOString(),
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || "Error interno del servidor" });
  }
};