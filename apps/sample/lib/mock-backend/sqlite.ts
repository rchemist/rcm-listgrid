import 'server-only';

import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import type { EntityStorePersistence, WithId } from './store';

type SampleDatabase = InstanceType<typeof Database>;

const globalForSqlite = globalThis as unknown as {
  __listgridSampleDatabases?: Map<string, SampleDatabase>;
};

function databasePath(): string {
  if (process.env.LISTGRID_SAMPLE_DB_PATH) return resolve(process.env.LISTGRID_SAMPLE_DB_PATH);
  const sampleRoot =
    basename(process.cwd()) === 'sample' ? process.cwd() : resolve(process.cwd(), 'apps/sample');
  return resolve(sampleRoot, '.data/listgrid-sample.sqlite');
}

function databases(): Map<string, SampleDatabase> {
  globalForSqlite.__listgridSampleDatabases ??= new Map();
  return globalForSqlite.__listgridSampleDatabases;
}

function openDatabase(): SampleDatabase {
  const path = databasePath();
  const cached = databases().get(path);
  if (cached) return cached;
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.exec(`
    CREATE TABLE IF NOT EXISTS sample_namespace (
      entity_name TEXT PRIMARY KEY,
      seeded_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sample_row (
      entity_name TEXT NOT NULL,
      id TEXT NOT NULL,
      payload TEXT NOT NULL,
      PRIMARY KEY (entity_name, id),
      FOREIGN KEY (entity_name) REFERENCES sample_namespace(entity_name) ON DELETE CASCADE
    );
  `);
  databases().set(path, db);
  return db;
}

function readRows<T extends WithId>(db: SampleDatabase, entityName: string): T[] {
  return db
    .prepare('SELECT payload FROM sample_row WHERE entity_name = ? ORDER BY rowid')
    .all(entityName)
    .map((row) => JSON.parse((row as { payload: string }).payload) as T);
}

function replaceRows<T extends WithId>(db: SampleDatabase, entityName: string, rows: T[]): void {
  db.prepare('DELETE FROM sample_row WHERE entity_name = ?').run(entityName);
  const insert = db.prepare('INSERT INTO sample_row (entity_name, id, payload) VALUES (?, ?, ?)');
  for (const row of rows) insert.run(entityName, row.id, JSON.stringify(row));
}

export function sqliteEntityPersistence<T extends WithId>(
  entityName: string,
  seed: T[],
): EntityStorePersistence<T> {
  const db = openDatabase();
  const initialize = db.transaction(() => {
    const inserted = db
      .prepare('INSERT OR IGNORE INTO sample_namespace (entity_name, seeded_at) VALUES (?, ?)')
      .run(entityName, new Date().toISOString());
    if (inserted.changes > 0) replaceRows(db, entityName, seed);
  });
  initialize();

  return {
    snapshot: () => readRows<T>(db, entityName),
    transaction: <R>(mutate: (rows: T[]) => R): R =>
      db.transaction(() => {
        const rows = readRows<T>(db, entityName);
        const result = mutate(rows);
        replaceRows(db, entityName, rows);
        return result;
      })(),
    reset: (nextSeed: T[]): T[] =>
      db.transaction(() => {
        db.prepare('DELETE FROM sample_namespace WHERE entity_name = ?').run(entityName);
        db.prepare('INSERT INTO sample_namespace (entity_name, seeded_at) VALUES (?, ?)').run(
          entityName,
          new Date().toISOString(),
        );
        replaceRows(db, entityName, nextSeed);
        return readRows<T>(db, entityName);
      })(),
  };
}

export function getSampleDatabasePath(): string {
  return databasePath();
}
