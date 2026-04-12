import pkg from 'pg';
const { Pool } = pkg;
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("Checking and adding missing columns...");
    
    // Add resourceType to resources
    await pool.query(`
      ALTER TABLE resources 
      ADD COLUMN IF NOT EXISTS "resourceType" text DEFAULT 'not-specified';
    `);
    console.log("Column 'resourceType' ensured.");

    // Ensure analytics tables exist (just in case)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visitors (
        id text PRIMARY KEY,
        first_seen timestamp DEFAULT now()
      );
    `);
    console.log("Table 'visitors' ensured.");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_stats (
        id serial PRIMARY KEY,
        total_joined_users integer DEFAULT 0 NOT NULL
      );
    `);
    console.log("Table 'site_stats' ensured.");

    process.exit(0);
  } catch (error) {
    console.error("Migration script failed:", error);
    process.exit(1);
  }
}

migrate();
