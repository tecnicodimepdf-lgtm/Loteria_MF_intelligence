
import sqlite3 from "sqlite3";

/**
 * Inicializa o esquema do banco de dados sql.js / sqlite3
 */
export function initDatabase(db: sqlite3.Database) {
  db.serialize(() => {
    // Tabela de sugestões original
    db.run(`
      CREATE TABLE IF NOT EXISTS suggestions (
        id TEXT PRIMARY KEY,
        timestamp INTEGER,
        games TEXT,
        concurso_alvo TEXT
      )
    `);

    // Adição do Wheel Engine - não altera nenhum código acima
    db.run(`ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS wheel_applied INTEGER DEFAULT 0`);
  });
}
