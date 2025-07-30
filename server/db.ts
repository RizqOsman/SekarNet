import dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";

dotenv.config();

// Use SQLite for development
const sqlite = new Database('sekar_net.db');
export const db = drizzle(sqlite, { schema });