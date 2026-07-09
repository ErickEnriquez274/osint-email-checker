import { Router } from "express";
import { checkDork } from "../controllers/dorkController";

const router = Router();
router.post("/", checkDork);

export default router;