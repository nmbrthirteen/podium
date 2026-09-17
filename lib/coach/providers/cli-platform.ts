import path from 'node:path';

const unixEnvKeys = ['PATH', 'HOME', 'USER', 'LOGNAME', 'TMPDIR', 'LANG'];

const windowsEnvKeys = [
  'PATH',
  'PATHEXT',
  'SYSTEMROOT',
  'SYSTEMDRIVE',
  'WINDIR',
  'COMSPEC',
  'USERPROFILE',
  'USERNAME',
  'HOMEDRIVE',
  'HOMEPATH',
  'APPDATA',
  'LOCALAPPDATA',
  'PROGRAMDATA',
  'PROGRAMFILES',
  'PROGRAMFILES(X86)',
  'TEMP',
  'TMP',
  'CLAUDE_CODE_GIT_BASH_PATH',
];

export function envKeys(platform: NodeJS.Platform) {
  return platform === 'win32' ? windowsEnvKeys : unixEnvKeys;
}

export function executableNames(name: string, platform: NodeJS.Platform, pathext = '') {
  if (platform !== 'win32') return [name];
  return (pathext || '.COM;.EXE;.BAT;.CMD')
    .split(';')
    .map(extension => extension.trim().toLowerCase())
    .filter(Boolean)
    .map(extension => `${name}${extension}`);
}

export function pathEntries(pathValue: string, delimiter: string) {
  return pathValue
    .split(delimiter)
    .map(entry => entry.trim().replace(/^"(.*)"$/, '$1'))
    .filter(Boolean);
}

export function shimScript(shimPath: string, contents: string) {
  const match = contents.match(/"%~?dp0%?[\\/]?([^"%]+\.[cm]?js)"/i);
  return match?.[1] ? path.win32.join(path.win32.dirname(shimPath), match[1]) : null;
}

export type SpawnPlan = { command: string; args: string[] };

export function spawnPlan(
  executable: string,
  args: string[],
  platform: NodeJS.Platform,
  nodePath: string,
  shimContents: string | null,
): SpawnPlan | null {
  if (platform !== 'win32' || !/\.(cmd|bat)$/i.test(executable)) return { command: executable, args };
  const script = shimContents ? shimScript(executable, shimContents) : null;
  return script ? { command: nodePath, args: [script, ...args] } : null;
}
