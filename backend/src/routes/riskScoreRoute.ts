import { Router } from "express";
import { recalculateRisk } from "../controllers/riskScoreController";

const router = Router();
router.post("/riskscore", recalculateRisk);

export default router;