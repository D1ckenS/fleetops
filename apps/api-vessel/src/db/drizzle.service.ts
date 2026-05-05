import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { resolve } from 'path';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private sqlite!: Database.Database;
  db!: BetterSQLite3Database<typeof schema>;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('DATABASE_URL', 'vessel.db');
    const migrationsFolder = resolve(this.config.get<string>('MIGRATIONS_DIR', 'drizzle'));

    this.sqlite = new Database(url);
    // WAL mode not supported by in-memory databases
    if (url !== ':memory:') {
      this.sqlite.pragma('journal_mode = WAL');
    }
    this.sqlite.pragma('foreign_keys = ON');
    this.db = drizzle(this.sqlite, { schema });
    migrate(this.db, { migrationsFolder });
  }

  onModuleDestroy() {
    if (this.sqlite?.open) {
      // Flush WAL before Electron quit to prevent data loss on hard reboot
      if (this.sqlite.pragma('journal_mode', { simple: true }) === 'wal') {
        this.sqlite.pragma('wal_checkpoint(TRUNCATE)');
      }
      this.sqlite.close();
    }
  }
}
