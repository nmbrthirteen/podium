'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MenuIcon, SearchIcon } from '@/components/ui/icons';
import { Sheet } from '@/components/ui/sheet';
import { brand } from '@/lib/brand';
import type { FrameData } from '../frame';
import { Sidebar } from './sidebar';

type MobileBarProps = {
  frame: FrameData;
  talkId: string | null;
  pathname: string;
  onSearch: () => void;
};

export function MobileBar({ frame, talkId, pathname, onSearch }: MobileBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-line bg-surface px-2 lg:hidden">
        <Button variant="quiet" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <MenuIcon />
        </Button>
        <Link href="/" className="flex-1 text-center font-display text-lg font-semibold">
          {brand.name}
        </Link>
        <Button variant="quiet" size="icon" aria-label="Search" onClick={onSearch}>
          <SearchIcon />
        </Button>
      </header>
      <Sheet open={open} onOpenChange={setOpen} title={brand.name} className="lg:hidden">
        <Sidebar
          frame={frame}
          talkId={talkId}
          pathname={pathname}
          showBrand={false}
          onNavigate={() => setOpen(false)}
          onSearch={() => {
            setOpen(false);
            onSearch();
          }}
        />
      </Sheet>
    </>
  );
}
