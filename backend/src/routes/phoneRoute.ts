import { Router } from "express";
import { checkPhone } from "../controllers/phoneController";

const router = Router();
router.post("/", checkPhone);

export default router;