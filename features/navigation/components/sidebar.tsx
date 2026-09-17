'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { CheckIcon, HomeIcon, PlusIcon, SearchIcon, SettingsIcon } from '@/components/ui/icons';
import { daysAwayShort } from '@/features/talks/talk-phase';
import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';
import type { FrameData, FrameTalk } from '../frame';
import { talkPages } from '../nav-items';
import { isCurrentPage } from '../paths';

type SidebarProps = {
  frame: FrameData;
  talkId: string | null;
  pathname: string;
  onSearch: () => void;
  onNavigate?: () => void;
  showBrand?: boolean;
};

const rowClass = 'flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium transition-colors';

export function Sidebar({ frame, talkId, pathname, onSearch, onNavigate, showBrand = true }: SidebarProps) {
  const settingsHref = frame.hosted ? '/account' : '/settings';
  const active = frame.talks.filter(talk => !talk.done);
  const finished = frame.talks.filter(talk => talk.done);

  return (
    <nav aria-label="Main" className="flex h-full flex-col gap-5 px-3 py-4">
      {showBrand && (
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-h-9 items-center px-2.5 font-display text-xl font-semibold"
        >
          {brand.name}
        </Link>
      )}

      <button
        type="button"
        onClick={onSearch}
        className="flex min-h-9 items-center gap-2.5 rounded-lg bg-surface px-2.5 text-sm text-muted shadow-card transition-colors hover:text-ink"
      >
        <SearchIcon size={16} />
        <span className="flex-1 text-left">Search</span>
        <kbd className="rounded-md bg-inset px-1.5 py-0.5 font-sans text-xs">⌘K</kbd>
      </button>

      <ul className="flex flex-col gap-0.5">
        <li>
          <NavLink href="/" icon={<HomeIcon size={16} />} current={pathname === '/'} onNavigate={onNavigate}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            href="/talks/new"
            icon={<PlusIcon size={16} />}
            current={pathname === '/talks/new'}
            onNavigate={onNavigate}
          >
            New talk
          </NavLink>
        </li>
      </ul>

      <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-1 pb-1">
        <TalkGroup label="Talks" talks={active} talkId={talkId} pathname={pathname} onNavigate={onNavigate} />
        {finished.length > 0 && (
          <TalkGroup label="Done" talks={finished} talkId={talkId} pathname={pathname} onNavigate={onNavigate} />
        )}
      </div>

      <NavLink
        href={settingsHref}
        icon={<SettingsIcon size={16} />}
        current={isCurrentPage(pathname, settingsHref)}
        onNavigate={onNavigate}
      >
        {frame.hosted ? 'Account' : 'Settings'}
      </NavLink>
    </nav>
  );
}

type TalkGroupProps = {
  label: string;
  talks: FrameTalk[];
  talkId: string | null;
  pathname: string;
  onNavigate?: () => void;
};

function TalkGroup({ label, talks, talkId, pathname, onNavigate }: TalkGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="px-2.5 text-xs font-medium text-muted">{label}</h2>
      <ul className="flex flex-col gap-0.5">
        {talks.map(talk => {
          const open = talk.id === talkId;
          return (
            <li key={talk.id} className="flex flex-col">
              <Link
                href={`/talks/${talk.id}/plan`}
                onClick={onNavigate}
                className={cn(rowClass, open ? 'text-ink' : 'text-muted hover:bg-ink/5 hover:text-ink')}
              >
                {talk.done ? (
                  <CheckIcon size={14} className="shrink-0 text-accent" />
                ) : (
                  <span
                    aria-hidden="true"
                    className={cn('size-2 shrink-0 rounded-full', talk.daysAway < 0 ? 'bg-line-strong' : 'bg-accent')}
                  />
                )}
                <span className="min-w-0 flex-1 truncate">{talk.title}</span>
                {!talk.done && <span className="text-xs text-muted tabular-nums">{daysAwayShort(talk.daysAway)}</span>}
              </Link>
              {open && (
                <ul className="mt-0.5 mb-2 ml-4 flex flex-col gap-0.5 border-l border-line pl-2">
                  {talkPages.map(page => {
                    const href = `/talks/${talk.id}/${page.segment}`;
                    const Icon = page.icon;
                    return (
                      <li key={page.segment}>
                        <NavLink
                          href={href}
                          icon={<Icon size={16} />}
                          current={isCurrentPage(pathname, href)}
                          onNavigate={onNavigate}
                          compact
                        >
                          {page.label}
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

type NavLinkProps = {
  href: string;
  icon: ReactNode;
  current: boolean;
  compact?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
};

function NavLink({ href, icon, current, compact = false, onNavigate, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={current ? 'page' : undefined}
      className={cn(
        rowClass,
        compact && 'min-h-8 font-normal',
        current ? 'bg-surface text-ink shadow-card' : 'text-muted hover:bg-ink/5 hover:text-ink',
      )}
    >
      <span className={cn('flex', current && 'text-accent')}>{icon}</span>
      {children}
    </Link>
  );
}
