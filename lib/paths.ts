import path from 'node:path';

function dataDir() {
  return process.env.PODIUM_DATA_DIR ?? path.join(process.cwd(), 'data');
}

export function dataPath(...segments: string[]) {
  return path.join(dataDir(), ...segments);
}

export function migrationsDir() {
  return path.join(process.cwd(), 'lib', 'db', 'migrations');
}
