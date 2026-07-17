import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "hms_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Immediate connection health-check verification
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("MySQL Database connected successfully! Pool connection acquired.");
    connection.release();
  } catch (err) {
    console.error("\x1b[31m%s\x1b[0m", "==========================================================");
    console.error("\x1b[31m%s\x1b[0m", "⚠️  WARNING: MySQL DATABASE CONNECTION FAILED!");
    console.error("\x1b[31m%s\x1b[0m", "Please ensure MySQL Server is active and hms_db exists.");
    console.error("\x1b[33m%s\x1b[0m", `Error details: ${err.message}`);
    console.error("\x1b[31m%s\x1b[0m", "==========================================================");
  }
})();

export default pool;
