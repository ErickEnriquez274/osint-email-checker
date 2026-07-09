import { Request, Response } from "express";
import { calculateRiskScore } from "../services/riskScore";

export const recalculateRisk = async (req: Request, res: Response) => {
  const { sitesCount } = req.body;
  const risk = calculateRiskScore({ breaches: null, sitesCount });
  res.json(risk);
};