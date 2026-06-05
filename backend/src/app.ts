import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import checkRoute from "./routes/checkRoute";
import phoneRoute from "./routes/phoneRoute";   // <- agrega esto

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Demasiadas consultas, espera unos minutos" }
});

app.use("/api/check", limiter);
app.use("/api/check", checkRoute);

app.use("/api/phone", limiter);        // <- agrega esto
app.use("/api/phone", phoneRoute);     // <- agrega esto

export default app;