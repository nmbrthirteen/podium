'use client';

import { useEffect, useRef } from 'react';

export type Hotkey = {
  keys: string[];
  handler: (event: KeyboardEvent) => void;
  allowRepeat?: boolean;
  yieldToButtons?: boolean;
};

const typingTags = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useHotkeys(hotkeys: Hotkey[], enabled = true) {
  const hotkeysRef = useRef(hotkeys);

  useEffect(() => {
    hotkeysRef.current = hotkeys;
  });

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || typingTags.has(target.tagName))) return;

      const match = hotkeysRef.current.find(hotkey => hotkey.keys.includes(event.key));
      if (!match) return;
      const onButton = target instanceof HTMLElement && target.closest('button, [role="button"], a[href]') !== null;
      if (match.yieldToButtons && onButton) return;
      event.preventDefault();
      if (event.repeat && !match.allowRepeat) return;
      match.handler(event);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
