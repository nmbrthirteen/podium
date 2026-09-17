'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { GlideMenu } from './glide-menu';

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;

export function MenuContent({ children, label }: { children: ReactNode; label: string }) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={4} align="end" className="z-50 outline-none">
        <BaseMenu.Popup
          aria-label={label}
          className="w-72 max-w-[calc(100vw-2rem)] origin-(--transform-origin) rounded-card bg-surface p-1 shadow-overlay outline-none transition-[opacity,scale] duration-(--motion-fast) ease-(--ease-out) data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
        >
          <GlideMenu className="flex flex-col">{children}</GlideMenu>
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

type MenuItemProps = ComponentProps<typeof BaseMenu.Item> & { description?: ReactNode };

export function MenuItem({ className, children, description, ...props }: MenuItemProps) {
  return (
    <BaseMenu.Item
      data-menu-row
      className={cn(
        'relative z-10 flex min-h-11 cursor-default flex-col justify-center rounded-control px-3 py-2 outline-none select-none data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <span className="font-medium">{children}</span>
      {description && <span className="text-sm text-muted">{description}</span>}
    </BaseMenu.Item>
  );
}
