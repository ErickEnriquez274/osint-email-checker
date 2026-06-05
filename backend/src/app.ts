import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import checkRoute from "./routes/checkRoute";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 consultas por IP cada 15 minutos
  message: { error: "Demasiadas consultas, espera unos minutos" }
});

app.use("/api/check", limiter);
app.use("/api/check", checkRoute);

export default app;