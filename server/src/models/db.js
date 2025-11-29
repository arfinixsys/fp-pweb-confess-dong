// models/db.js
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = path.join(__dirname, '../../db/confess.db');
const SCHEMA = path.join(__dirname, '../../db/schema.sql');
const SEED = path.join(__dirname, '../../db/seed.sql');
const DB_DIR = path.dirname(DB_PATH);

// Ensure db directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const dbExists = fs.existsSync(DB_PATH);
const db = new Database(DB_PATH);

function migrate() {
  const sql = fs.readFileSync(SCHEMA, 'utf-8');
  db.exec(sql);
  console.log('Database schema migrated.');
}

function seed() {
  const sql = fs.readFileSync(SEED, 'utf-8');
  db.exec(sql);
  console.log('Database seeded.');
}

if (!dbExists) {
  migrate();
  seed();
}

if (require.main === module) {
  // CLI usage: node models/db.js --migrate or --seed
  const arg = process.argv[2];
  if (arg === '--migrate') migrate();
  else if (arg === '--seed') seed();
  else {
    migrate();
    seed();
  }
  process.exit(0);
}

module.exports = db;
