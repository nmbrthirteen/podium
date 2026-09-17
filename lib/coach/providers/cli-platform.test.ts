import { describe, expect, it } from 'vitest';
import { envKeys, executableNames, pathEntries, shimScript, spawnPlan } from './cli-platform';

const npmShim = `@ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0

IF EXIST "%dp0%\\node.exe" (
  SET "_prog=%dp0%\\node.exe"
) ELSE (
  SET "_prog=node"
  SET PATHEXT=%PATHEXT:;.JS;=;%
)

endLocal & goto #_undefined_# 2>NUL || title %COMSPEC% & "%_prog%"  "%dp0%\\node_modules\\@anthropic-ai\\claude-code\\cli.js" %*
`;

const olderShim = `@IF EXIST "%~dp0\\node.exe" (
  "%~dp0\\node.exe"  "%~dp0\\node_modules\\@openai\\codex\\bin\\codex.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node  "%~dp0\\node_modules\\@openai\\codex\\bin\\codex.js" %*
)`;

describe('executableNames', () => {
  it('uses the bare name outside Windows', () => {
    expect(executableNames('claude', 'darwin')).toEqual(['claude']);
  });

  it('tries each PATHEXT extension in order on Windows', () => {
    expect(executableNames('claude', 'win32', '.COM;.EXE;.BAT;.CMD')).toEqual([
      'claude.com',
      'claude.exe',
      'claude.bat',
      'claude.cmd',
    ]);
    expect(executableNames('codex', 'win32')).toContain('codex.cmd');
  });
});

describe('pathEntries', () => {
  it('drops empty entries and quotes around folders', () => {
    expect(pathEntries('"C:\\Program Files\\nodejs";;C:\\Users\\me\\AppData\\Roaming\\npm', ';')).toEqual([
      'C:\\Program Files\\nodejs',
      'C:\\Users\\me\\AppData\\Roaming\\npm',
    ]);
  });
});

describe('shimScript', () => {
  it('finds the script inside a current npm shim', () => {
    expect(shimScript('C:\\Users\\me\\AppData\\Roaming\\npm\\claude.cmd', npmShim)).toBe(
      'C:\\Users\\me\\AppData\\Roaming\\npm\\node_modules\\@anthropic-ai\\claude-code\\cli.js',
    );
  });

  it('finds the script inside an older npm shim', () => {
    expect(shimScript('C:\\npm\\codex.cmd', olderShim)).toBe('C:\\npm\\node_modules\\@openai\\codex\\bin\\codex.js');
  });

  it('returns null when the shim names no script', () => {
    expect(shimScript('C:\\bin\\claude.cmd', '@echo off\r\nclaude.exe %*')).toBeNull();
  });
});

describe('spawnPlan', () => {
  it('runs executables directly', () => {
    expect(spawnPlan('/usr/local/bin/claude', ['-p'], 'darwin', 'node', null)).toEqual({
      command: '/usr/local/bin/claude',
      args: ['-p'],
    });
    expect(spawnPlan('C:\\bin\\claude.exe', ['-p'], 'win32', 'node', null)).toEqual({
      command: 'C:\\bin\\claude.exe',
      args: ['-p'],
    });
  });

  it('runs the script behind an npm shim with Node on Windows', () => {
    expect(spawnPlan('C:\\npm\\codex.cmd', ['exec'], 'win32', 'C:\\node\\node.exe', olderShim)).toEqual({
      command: 'C:\\node\\node.exe',
      args: ['C:\\npm\\node_modules\\@openai\\codex\\bin\\codex.js', 'exec'],
    });
  });

  it('refuses a shim it cannot read', () => {
    expect(spawnPlan('C:\\bin\\claude.cmd', [], 'win32', 'node', '@echo off')).toBeNull();
  });
});

describe('envKeys', () => {
  it('passes the profile and temp folders on Windows', () => {
    expect(envKeys('win32')).toEqual(expect.arrayContaining(['USERPROFILE', 'APPDATA', 'TEMP', 'SYSTEMROOT']));
    expect(envKeys('darwin')).toContain('HOME');
  });
});
