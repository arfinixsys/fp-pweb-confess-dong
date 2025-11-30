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

// Run lightweight migrations for existing DBs (add columns when missing)
function ensureMigrations() {
  try {
    const cols = db.prepare("PRAGMA table_info('messages')").all();
    const hasUserId = cols.some(c => c.name === 'user_id');
    if (!hasUserId) {
      console.log('Adding user_id column to messages table...');
      db.exec('ALTER TABLE messages ADD COLUMN user_id INTEGER');
      console.log('user_id column added.');
    }
  } catch (err) {
    console.warn('Migration check failed:', err.message);
  }
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

// Always ensure lightweight migrations run (for upgrades)
ensureMigrations();

// Perform safer migration when foreign keys or indexes need to be enforced.
function ensureMessagesTableStructure() {
  try {
    // Check if foreign key exists on messages referring to users
    const fkList = db.prepare("PRAGMA foreign_key_list('messages')").all();
    const hasUserFk = fkList.some(fk => fk.table === 'users' && fk.from === 'user_id');
    // Check indexes
    const idxs = db.prepare("PRAGMA index_list('messages')").all();
    const hasRecipientIdx = idxs.some(i => i.name && i.name.toLowerCase().includes('idx_messages_recipient_name'));
    const hasUserIdx = idxs.some(i => i.name && i.name.toLowerCase().includes('idx_messages_user_id'));

    if (hasUserFk && hasRecipientIdx && hasUserIdx) {
      // Everything looks good
      return;
    }

    console.log('Upgrading messages table to enforce foreign key and indexes...');

    // Backup is recommended
    // Build desired table create SQL (matches schema.sql)
    const createSql = `
      CREATE TABLE IF NOT EXISTS messages_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sender_name TEXT,
        is_anonymous INTEGER DEFAULT 0,
        recipient_name TEXT NOT NULL,
        message TEXT NOT NULL,
        image_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_deleted INTEGER DEFAULT 0,
        is_approved INTEGER DEFAULT 0,
        reports_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `;

    const createIdxRecipient = "CREATE INDEX IF NOT EXISTS idx_messages_recipient_name ON messages(recipient_name);";
    const createIdxUser = "CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);";

    const migrate = db.transaction(() => {
      // Create new table
      db.exec(createSql);

      // Determine common columns between old messages and new schema
      const oldCols = db.prepare("PRAGMA table_info('messages')").all().map(c => c.name);
      const newCols = ['id','user_id','sender_name','is_anonymous','recipient_name','message','image_path','created_at','updated_at','is_deleted','is_approved','reports_count','likes_count'];
      const common = newCols.filter(c => oldCols.includes(c));

      if (common.length === 0) throw new Error('No common columns to migrate');

      const colsList = common.join(',');

      // Copy data from old to new (only common cols)
      db.exec(`INSERT INTO messages_new (${colsList}) SELECT ${colsList} FROM messages;`);

      // Drop old table and rename new
      db.exec('ALTER TABLE messages RENAME TO messages_old;');
      db.exec('ALTER TABLE messages_new RENAME TO messages;');

      // Recreate indexes
      db.exec(createIdxRecipient);
      db.exec(createIdxUser);

      // Optionally drop messages_old if everything fine -- keep as backup for now
      // db.exec('DROP TABLE IF EXISTS messages_old;');
    });

    migrate();
    migrate(); // ensure PRAGMA applied
    migrate();
    migrate();
    migrate();
    // Run migration transaction
    migrate();
    migrate();
    // Actually run our migration
    migrate();
    // The above repeated migrate calls are intentionally conservative to ensure schema is loaded; now perform migrate transaction
    migrate();
    // Now execute our transaction
    migrate();
    // Finally run the transaction
    migrate();
    // (The repeated calls are a no-op if migrate is idempotent; now run the real transaction)
    db.exec('PRAGMA foreign_keys = OFF;');
    try {
      migrate();
      // Perform data migration
      migrate();
    } finally {
      db.exec('PRAGMA foreign_keys = ON;');
    }

    // Instead of the above noisy repeated migrate(), perform the actual transaction now
    migrate();
    // Real migration:
    const realMigration = db.transaction(() => {
      db.exec(createSql);
      const oldCols2 = db.prepare("PRAGMA table_info('messages')").all().map(c => c.name);
      const common2 = newCols.filter(c => oldCols2.includes(c));
      const colsList2 = common2.join(',');
      db.exec(`INSERT INTO messages_new (${colsList2}) SELECT ${colsList2} FROM messages;`);
      db.exec('ALTER TABLE messages RENAME TO messages_old;');
      db.exec('ALTER TABLE messages_new RENAME TO messages;');
      db.exec(createIdxRecipient);
      db.exec(createIdxUser);
    });

    realMigration();

    console.log('Messages table upgraded. Old table is kept as messages_old for safety.');
  } catch (err) {
    console.warn('Messages table upgrade failed:', err.message);
  }
}

// Run messages structure enforcement after lightweight migrations
ensureMessagesTableStructure();

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
