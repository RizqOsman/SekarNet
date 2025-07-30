import { db } from "./db";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { sql } from "drizzle-orm";
import * as schema from "@shared/schema";

async function runMigrations() {
  console.log("Running database migrations...");

  try {
    // Create tables manually since we don't have migration files
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT NOT NULL DEFAULT 'customer',
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        speed INTEGER NOT NULL,
        upload_speed INTEGER NOT NULL,
        price INTEGER NOT NULL,
        features TEXT,
        is_popular INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        start_date INTEGER DEFAULT (unixepoch()),
        end_date INTEGER,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS installation_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        address TEXT NOT NULL,
        preferred_date INTEGER,
        status TEXT NOT NULL DEFAULT 'pending',
        technician_id INTEGER,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS bills (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        subscription_id INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        due_date INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'unpaid',
        payment_date INTEGER,
        payment_proof TEXT,
        period TEXT NOT NULL,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        category TEXT NOT NULL,
        technician_id INTEGER,
        resolution TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        type TEXT NOT NULL,
        is_read INTEGER DEFAULT 0,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS technician_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        technician_id INTEGER NOT NULL,
        job_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        address TEXT NOT NULL,
        scheduled_date INTEGER,
        completed_date INTEGER,
        notes TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS user_activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        activity TEXT NOT NULL,
        details TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at INTEGER DEFAULT (unixepoch())
      )
    `);

    await db.run(sql`
      CREATE TABLE IF NOT EXISTS connection_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        download_speed REAL,
        upload_speed REAL,
        latency REAL,
        packet_loss REAL,
        timestamp INTEGER DEFAULT (unixepoch())
      )
    `);

    console.log("✓ All tables created successfully");

  } catch (error) {
    console.error("❌ Error running migrations:", error);
    throw error;
  }
}

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      console.log("Migrations completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migrations failed:", error);
      process.exit(1);
    });
}

export { runMigrations }; 