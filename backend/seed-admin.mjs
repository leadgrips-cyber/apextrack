/**
 * Admin bootstrap seed script.
 * Creates the initial SUPER_ADMIN account if it does not already exist.
 * Uses bcryptjs (12 rounds) — identical to src/utils/hash.ts.
 *
 * Usage:
 *   node seed-admin.mjs
 * Run from the backend/ directory (reads .env automatically).
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const { Pool } = pg;

const ADMIN_EMAIL    = 'admin@apextrack.com';
const ADMIN_PASSWORD = 'Admin@123';
const ADMIN_NAME     = 'ApexTrack Admin';
const ADMIN_ROLE     = 'SUPER_ADMIN';
const SALT_ROUNDS    = 12;

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME     || 'apextrack',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

try {
  // Check if the account already exists.
  const existing = await pool.query(
    'SELECT id, email, role FROM admins WHERE email = $1',
    [ADMIN_EMAIL]
  );

  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    console.log('Admin account already exists — no changes made.');
    console.log('  id   :', row.id);
    console.log('  email:', row.email);
    console.log('  role :', row.role);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO admins (email, full_name, role, is_active, password_hash)
     VALUES ($1, $2, $3, TRUE, $4)
     RETURNING id, email, full_name, role, is_active, created_at`,
    [ADMIN_EMAIL, ADMIN_NAME, ADMIN_ROLE, passwordHash]
  );

  const admin = result.rows[0];
  console.log('Admin account created successfully.');
  console.log('  id        :', admin.id);
  console.log('  email     :', admin.email);
  console.log('  full_name :', admin.full_name);
  console.log('  role      :', admin.role);
  console.log('  is_active :', admin.is_active);
  console.log('  created_at:', admin.created_at);
} catch (err) {
  console.error('Seed failed:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
