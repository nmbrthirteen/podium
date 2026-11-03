const loopbackNames = new Set(['localhost', '127.0.0.1', '[::1]']);

export function isLoopbackHost(hostHeader: string | null) {
  if (!hostHeader) return false;
  const name = hostHeader.startsWith('[') ? hostHeader.slice(0, hostHeader.indexOf(']') + 1) : hostHeader.split(':')[0];

  return loopbackNames.has((name ?? '').toLowerCase());
}
