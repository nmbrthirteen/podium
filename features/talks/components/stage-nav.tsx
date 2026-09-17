'use client';

import Link from 'next/link';
import { talkPages } from '@/features/navigation/nav-items';
import { isCurrentPage } from '@/features/navigation/paths';
import { cn } from '@/lib/utils';

const mobilePages = talkPages.filter(page => page.segment !== 'debrief');

export function StageNav({ talkId, pathname }: { talkId: string; pathname: string }) {
  return (
    <nav
      aria-label="Talk pages"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg">
        {mobilePages.map(page => {
          const href = `/talks/${talkId}/${page.segment}`;
          const current = isCurrentPage(pathname, href);
          const Icon = page.icon;
          return (
            <li key={page.segment} className="flex-1">
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors',
                  current ? 'text-accent' : 'text-muted hover:text-ink',
                )}
              >
                <Icon size={22} />
                {page.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
