import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import checkRoute from "./routes/checkRoute";
import phoneRoute from "./routes/phoneRoute";
import authRoute from "./routes/authRoute";       // <- nuevo

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: "Demasiadas consultas" } });

app.use("/api/auth", authRoute);                  // <- nuevo (sin rate limit estricto)
app.use("/api/check", limiter, checkRoute);
app.use("/api/phone", limiter, phoneRoute);

export default app;