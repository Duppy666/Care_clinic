import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlFilePath = path.join(__dirname, "schema.sql");

async function initDb() {
  console.log("Reading schema.sql database script...");
  let sqlContent;
  try {
    sqlContent = fs.readFileSync(sqlFilePath, "utf8");
  } catch (err) {
    console.error("Failed to read schema.sql file:", err.message);
    process.exit(1);
  }

  console.log(`Connecting to MySQL at ${process.env.DB_HOST} as user '${process.env.DB_USER}'...`);
  
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      multipleStatements: true // Allows executing multiple queries separated by semicolons
    });
  } catch (err) {
    console.error("MySQL connection failed. Please make sure your server is active.");
    console.error("Details:", err.message);
    process.exit(1);
  }

  try {
    console.log("Executing SQL queries to initialize database tables and seed mock data...");
    await connection.query(sqlContent);
    console.log("\x1b[32m%s\x1b[0m", "==========================================================");
    console.log("\x1b[32m%s\x1b[0m", "🎉 DATABASE hms_db INITIALIZED SUCCESSFULLY!");
    console.log("\x1b[32m%s\x1b[0m", "Tables created and seeded with presentation mock records.");
    console.log("\x1b[32m%s\x1b[0m", "==========================================================");
  } catch (err) {
    console.error("Failed to initialize database tables:", err.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

initDb();
