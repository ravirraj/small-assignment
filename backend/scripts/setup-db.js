require("dotenv").config();
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  console.log("Running schema...");
  await pool.query(schema);
  console.log("Schema applied successfully.");

  await pool.end();
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
