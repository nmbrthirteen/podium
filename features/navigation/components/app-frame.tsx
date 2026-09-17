'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useState } from 'react';
import { StageNav } from '@/features/talks/components/stage-nav';
import { cn } from '@/lib/utils';
import type { FrameData } from '../frame';
import { activeTalkId, isFocusPath } from '../paths';
import { CommandPalette } from './command-palette';
import { MobileBar } from './mobile-bar';
import { Sidebar } from './sidebar';

export function AppFrame({ frame, children }: { frame: FrameData | null; children: ReactNode }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  if (!frame || isFocusPath(pathname)) return children;

  const talkId = activeTalkId(pathname);
  const openSearch = () => setSearchOpen(true);

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15.5rem_minmax(0,1fr)]">
      <div className="hidden lg:block">
        <div className="sticky top-0 h-dvh">
          <Sidebar frame={frame} talkId={talkId} pathname={pathname} onSearch={openSearch} />
        </div>
      </div>
      <MobileBar frame={frame} talkId={talkId} pathname={pathname} onSearch={openSearch} />
      <main className="min-w-0 lg:py-2 lg:pr-2">
        <div
          className={cn(
            'min-h-dvh bg-surface lg:min-h-[calc(100dvh-1rem)] lg:rounded-2xl lg:shadow-card',
            talkId && 'pb-20 lg:pb-0',
          )}
        >
          {children}
        </div>
      </main>
      {talkId && <StageNav talkId={talkId} pathname={pathname} />}
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} frame={frame} talkId={talkId} />
    </div>
  );
}
