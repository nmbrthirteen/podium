import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { ChevronLeftIcon } from '@/components/ui/icons';
import { brand } from '@/lib/brand';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: ReactNode;
  back?: { href: string; label: string };
  brandMark?: boolean;
  width?: 'md' | 'lg';
};

export function AppShell({ children, back, brandMark = false, width = 'md' }: AppShellProps) {
  const widthClass = width === 'lg' ? 'max-w-5xl' : 'max-w-3xl';

  return (
    <div className={cn('mx-auto flex w-full flex-col gap-10 px-5 pt-6 pb-16 sm:px-8 lg:pt-10', widthClass)}>
      {back && (
        <Link
          href={back.href}
          className={cn(buttonVariants({ variant: 'quiet', size: 'sm' }), '-ml-3 self-start text-muted')}
        >
          <ChevronLeftIcon size={18} />
          <span className="truncate">{back.label}</span>
        </Link>
      )}
      {brandMark && (
        <Link href="/" className="flex min-h-10 items-center self-start font-display text-xl font-semibold">
          {brand.name}
        </Link>
      )}
      {children}
    </div>
  );
}
