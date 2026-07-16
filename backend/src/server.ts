import "dotenv/config";
import app from "./app";
import pool from "./db/connection";
pool.getConnection()
  .then(conn => {
    console.log("✅ Base de datos conectada");
    conn.release();
  })
  .catch(err => console.error("❌ Error DB:", err.message));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});