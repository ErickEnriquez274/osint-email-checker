import { Request, Response } from "express";
import { searchGoogleDork } from "../services/googleDorkService";

export const checkDork = async (req: Request, res: Response) => {
  const { query, location } = req.body;

  if (!query || query.trim().length < 3) {
    res.status(400).json({ error: "Escribe un dork válido" });
    return;
  }

  try {
    const results = await searchGoogleDork(query, location);
    res.json({
      query,
      location: location || null,
      total: results.length,
      results,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Error al ejecutar el dork" });
  }
};