#!/usr/bin/env bun

/**
 * Migration script: Pollarys → Pollarys
 *
 * This script migrates user data from ~/.config/pollarys/ to ~/.config/pollarys/
 * It is idempotent and safe to run multiple times.
 *
 * Usage: bun scripts/migrate-from-pollarys.mjs
 */

import { existsSync, mkdirSync, cpSync, rmSync, renameSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { homedir, platform } from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function dirname(path: string): string {
  return path.substring(0, path.lastIndexOf('/'));
}

// ----------------------------------------------------------------------------
// Logger
// ----------------------------------------------------------------------------

const log = {
  info: (msg: string) => console.log(`\x1b[36m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[SUCCESS]\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m[WARN]\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m[ERROR]\x1b[0m ${msg}`),
};

// ----------------------------------------------------------------------------
// Platform-specific config paths
// ----------------------------------------------------------------------------

function getConfigBaseDir(): string {
  const platformName = platform();

  if (platformName === 'darwin') {
    // macOS: ~/Library/Application Support
    return join(homedir(), 'Library', 'Application Support');
  } else if (platformName === 'win32') {
    // Windows: %APPDATA%
    return process.env.APPDATA || join(homedir(), 'AppData', 'Roaming');
  } else {
    // Linux/BSD: ~/.config
    return join(homedir(), '.config');
  }
}

function getAppDataDir(appName: string): string {
  return join(getConfigBaseDir(), appName);
}

// ----------------------------------------------------------------------------
// Migration logic
// ----------------------------------------------------------------------------

const OLD_APP_NAME = 'pollarys';
const NEW_APP_NAME = 'pollarys';

const oldDir = getAppDataDir(OLD_APP_NAME);
const newDir = getAppDataDir(NEW_APP_NAME);
const sentinelFile = join(newDir, '.migrated-from-pollarys');

function checkSentinel(): boolean {
  return existsSync(sentinelFile);
}

function createSentinel(): void {
  writeFileSync(sentinelFile, `Migration from ${OLD_APP_NAME} completed on ${new Date().toISOString()}\n`, 'utf8');
}

function ensureNewDir(): void {
  if (!existsSync(newDir)) {
    log.info(`Creating new config directory: ${newDir}`);
    mkdirSync(newDir, { recursive: true });
  }
}

function copyDir(src: string, dest: string): void {
  if (!existsSync(src)) {
    log.warn(`Source directory does not exist: ${src}`);
    return;
  }

  log.info(`Copying ${src} → ${dest}`);

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      cpSync(srcPath, destPath, { recursive: true });
    }
  }
}

function replaceInFile(filePath: string, oldStr: string, newStr: string): void {
  try {
    const content = readFileSync(filePath, 'utf8');
    if (content.includes(oldStr)) {
      const newContent = content.split(oldStr).join(newStr);
      writeFileSync(filePath, newContent, 'utf8');
      log.debug(`Replaced in: ${filePath}`);
    }
  } catch (err) {
    log.warn(`Failed to update ${filePath}: ${err}`);
  }
}

function migrateConfigFiles(dir: string): void {
  // Walk through all JSON and JS files and replace hardcoded paths/names
  const filesToCheck: string[] = [];

  function collectFiles(dirPath: string): void {
    if (!existsSync(dirPath)) return;

    const entries = readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, dist, .git
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git' || entry.name === '.cache') {
          continue;
        }
        collectFiles(fullPath);
      } else if (fullPath.endsWith('.json') || fullPath.endsWith('.js') || fullPath.endsWith('.ts') || fullPath.endsWith('.mjs')) {
        filesToCheck.push(fullPath);
      }
    }
  }

  collectFiles(dir);

  log.info(`Scanning ${filesToCheck.length} files for path updates...`);

  let replacedCount = 0;
  for (const file of filesToCheck) {
    try {
      const content = readFileSync(file, 'utf8');
      let newContent = content;

      // Replace paths: ~/.config/pollarys/ → ~/.config/pollarys/
      newContent = newContent.replace(/\~\/\.config\/pollarys\/g, '~/.config/pollarys/');
      newContent = newContent.replace(/\.config\\pollarys\\/g, '\\.config\\pollarys\\');

      // Replace default data dir mentions
      newContent = newContent.replace(/pollarysDataDir/g, 'pollarysDataDir');
      newContent = newContent.replace(/POLLARYS_DATA_DIR/g, 'POLLARYS_DATA_DIR');
      newContent = newContent.replace(/POLLARYS_PORT/g, 'POLLARYS_PORT');
      newContent = newContent.replace(/POLLARYS_HOST/g, 'POLLARYS_HOST');
      newContent = newContent.replace(/POLLARYS_TUNNEL/g, 'POLLARYS_TUNNEL');
      newContent = newContent.replace(/POLLARYS_OPENCODE_HOSTNAME/g, 'POLLARYS_OPENCODE_HOSTNAME');
      newContent = newContent.replace(/pollarys\.i18n\.v1/g, 'pollarys.i18n.v1');
      newContent = newContent.replace(/pollarys-pwa/g, 'pollarys-pwa');

      if (newContent !== content) {
        writeFileSync(file, newContent, 'utf8');
        replacedCount++;
      }
    } catch (err) {
      // Binary files or permission errors - skip
    }
  }

  log.info(`Updated ${replacedCount} config files`);
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------

function main(): void {
  log.info('=== Pollarys → Pollarys Migration Tool ===');
  log.info(`Old directory: ${oldDir}`);
  log.info(`New directory: ${newDir}`);

  // Check if migration already done
  if (checkSentinel()) {
    log.success('Migration already completed (sentinel found). Exiting.');
    process.exit(0);
  }

  // Check if old directory exists
  if (!existsSync(oldDir)) {
    log.warn('Old config directory not found. Nothing to migrate.');
    log.info('Creating new config directory structure...');
    ensureNewDir();
    createSentinel();
    log.success('Setup complete. No data to migrate from previous version.');
    return;
  }

  // Check if new directory already has data (without sentinel)
  const newDirHasData = existsSync(newDir) && readdirSync(newDir).length > 0;
  if (newDirHasData) {
    log.warn(`New directory already exists and is not empty: ${newDir}`);
    const response = prompt('New config dir exists. Overwrite? (yes/no): ');
    if (response !== 'yes') {
      log.error('Migration aborted by user.');
      process.exit(1);
    }
  }

  try {
    log.info('Starting migration...');

    // Ensure new directory exists
    ensureNewDir();

    // Copy entire old directory to new
    copyDir(oldDir, newDir);

    // Post-copy: replace references in configuration files
    migrateConfigFiles(newDir);

    // Create sentinel
    createSentinel();

    log.success('✅ Migration completed successfully!');
    log.info(`User data moved to: ${newDir}`);
    log.info('You can now delete the old directory if you wish:');
    log.info(`  rm -rf ${oldDir}`);

  } catch (err) {
    log.error(`Migration failed: ${err}`);
    process.exit(1);
  }
}

// ----------------------------------------------------------------------------
// Helper: readdirSync wrapper
// ----------------------------------------------------------------------------

import { readdirSync } from 'fs';

// ----------------------------------------------------------------------------
// Prompt helper (simple)
// ----------------------------------------------------------------------------

function prompt(question: string): string {
  process.stdout.write(question);
  return readlineSync();
}

// Simple sync readline for Bun
function readlineSync(): string {
  const buf: string[] = [];
  return new Promise((resolve) => {
    process.stdin.on('data', (data) => {
      buf.push(data.toString());
      if (data.toString().includes('\n')) {
        process.stdin.pause();
        resolve(buf.join('').trim());
      }
    });
    process.stdin.resume();
  });
}

// Call main
main();
