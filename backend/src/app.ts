import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import checkRoute from "./routes/checkRoute";
import phoneRoute from "./routes/phoneRoute";
import authRouter from "./routes/auth";

const app = express();

// ── Middleware global (DEBE ir antes de las rutas) ──
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

// ── Rutas ──
app.use("/api/auth", authRouter);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiadas consultas, espera unos minutos" }
});

app.use("/api/check", limiter);
app.use("/api/check", checkRoute);
app.use("/api/phone", limiter);
app.use("/api/phone", phoneRoute);

export default app;