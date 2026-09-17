const talkPath = /^\/talks\/([^/]+)/;
const focusPath = /^\/talks\/[^/]+\/(practice\/[^/]+|present\/live)(\/|$)|^\/(sign-in|sign-up)(\/|$)/;

export function activeTalkId(pathname: string) {
  const id = pathname.match(talkPath)?.[1];
  return id && id !== 'new' ? id : null;
}

export function isFocusPath(pathname: string) {
  return focusPath.test(pathname);
}

export function isCurrentPage(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
