'use client';

import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CalendarIcon, HomeIcon, type IconComponent, PlusIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';
import type { FrameData } from '../frame';
import { talkPages } from '../nav-items';

type Command = { id: string; group: string; label: string; href: string; icon: IconComponent };

type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  frame: FrameData;
  talkId: string | null;
};

export function CommandPalette({ open, onOpenChange, frame, talkId }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onOpenChange]);

  const current = frame.talks.find(talk => talk.id === talkId);
  const commands: Command[] = [
    ...(current
      ? talkPages.map(page => ({
          id: `page-${page.segment}`,
          group: current.title,
          label: page.label,
          href: `/talks/${current.id}/${page.segment}`,
          icon: page.icon,
        }))
      : []),
    ...frame.talks.map(talk => ({
      id: `talk-${talk.id}`,
      group: 'Talks',
      label: talk.title,
      href: `/talks/${talk.id}/plan`,
      icon: CalendarIcon,
    })),
    { id: 'new-talk', group: 'Go to', label: 'New talk', href: '/talks/new', icon: PlusIcon },
    { id: 'home', group: 'Go to', label: 'Home', href: '/', icon: HomeIcon },
    {
      id: 'settings',
      group: 'Go to',
      label: frame.hosted ? 'Account' : 'Settings',
      href: frame.hosted ? '/account' : '/settings',
      icon: SettingsIcon,
    },
  ];

  const needle = query.trim().toLowerCase();
  const results = needle
    ? commands.filter(command => `${command.label} ${command.group}`.toLowerCase().includes(needle))
    : commands;
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const close = () => {
    onOpenChange(false);
    setQuery('');
    setActive(0);
  };

  const go = (command: Command | undefined) => {
    if (!command) return;
    close();
    router.push(command.href);
  };

  return (
    <BaseDialog.Root open={open} onOpenChange={next => (next ? onOpenChange(true) : close())}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-scrim transition-opacity duration-(--motion-base) data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <BaseDialog.Popup className="fixed top-[12dvh] left-1/2 z-50 flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 flex-col overflow-hidden rounded-2xl bg-surface shadow-overlay transition-[opacity,scale] duration-(--motion-base) ease-(--ease-out) data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <BaseDialog.Title className="sr-only">Search</BaseDialog.Title>
          <div className="flex items-center gap-3 border-b border-line px-4">
            <SearchIcon size={18} className="shrink-0 text-muted" />
            <input
              value={query}
              aria-label="Search talks and pages"
              placeholder="Search talks and pages"
              className="h-14 w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
              onChange={event => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={event => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  setActive(Math.min(activeIndex + 1, results.length - 1));
                } else if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  setActive(Math.max(activeIndex - 1, 0));
                } else if (event.key === 'Enter') {
                  event.preventDefault();
                  go(results[activeIndex]);
                }
              }}
            />
          </div>
          {results.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted">No matches</p>
          ) : (
            <ul className="flex flex-col overflow-y-auto p-2">
              {results.map((command, index) => {
                const Icon = command.icon;
                const firstInGroup = index === 0 || results[index - 1]?.group !== command.group;
                return (
                  <li key={command.id} className="flex flex-col">
                    {firstInGroup && (
                      <span className="truncate px-3 pt-3 pb-1 text-xs font-medium text-muted">{command.group}</span>
                    )}
                    <button
                      type="button"
                      onMouseMove={() => setActive(index)}
                      onClick={() => go(command)}
                      className={cn(
                        'flex min-h-10 items-center gap-3 rounded-lg px-3 text-left text-sm text-ink',
                        index === activeIndex && 'bg-inset',
                      )}
                    >
                      <Icon size={16} className="shrink-0 text-muted" />
                      <span className="truncate">{command.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
