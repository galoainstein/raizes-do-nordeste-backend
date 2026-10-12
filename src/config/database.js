const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config();

const dbFile = process.env.DB_FILE || './database/raizes.db';
const db = new Database(path.resolve(dbFile));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

module.exports = db;