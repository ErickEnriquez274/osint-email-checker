import { Router } from "express";
import { checkEmail } from "../controllers/checkController";

const router = Router();
router.post("/", checkEmail);

export default router;