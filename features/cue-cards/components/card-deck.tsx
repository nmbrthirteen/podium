'use client';

import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'motion/react';
import { type ReactNode, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cn } from '@/lib/utils';

const swipeDistance = 80;
const swipeVelocity = 400;
const interactive = 'input, textarea, button, select, a, [role="separator"], [contenteditable="true"]';

type CardDeckProps = {
  count: number;
  index: number;
  onIndexChange: (index: number) => void;
  label: string;
  children: ReactNode;
};

export function CardDeck({ count, index, onIndexChange, label, children }: CardDeckProps) {
  const reduceMotion = useReducedMotion();
  const controls = useDragControls();
  const previous = useRef(index);
  const direction = index >= previous.current ? 1 : -1;

  useEffect(() => {
    previous.current = index;
  }, [index]);

  const go = (next: number) => {
    if (next >= 0 && next < count && next !== index) onIndexChange(next);
  };

  const variants = {
    enter: (dir: number) => (reduceMotion ? { opacity: 0 } : { x: dir * 64, opacity: 0, scale: 0.98 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => (reduceMotion ? { opacity: 0 } : { x: dir * -64, opacity: 0, scale: 0.98 }),
  };

  return (
    <section aria-roledescription="carousel" aria-label={label} className="flex flex-col gap-4">
      <div className="relative">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', duration: 0.35, bounce: 0 }}
            drag="x"
            dragControls={controls}
            dragListener={false}
            dragSnapToOrigin
            dragElastic={0.5}
            onPointerDown={event => {
              if (event.target instanceof Element && event.target.closest(interactive)) return;
              controls.start(event);
            }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -swipeDistance || info.velocity.x < -swipeVelocity) go(index + 1);
              else if (info.offset.x > swipeDistance || info.velocity.x > swipeVelocity) go(index - 1);
            }}
            style={{ touchAction: 'pan-y' }}
            className="relative cursor-grab active:cursor-grabbing"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button
          variant="quiet"
          size="icon"
          aria-label="Previous card"
          disabled={index === 0}
          onClick={() => go(index - 1)}
        >
          <ChevronLeftIcon />
        </Button>
        <span aria-hidden="true" className="flex items-center gap-1.5">
          {Array.from({ length: count }, (_, position) => position).map(position => (
            <span
              key={position}
              className={cn('deck-dot h-2 rounded-full', position === index ? 'w-6 bg-accent' : 'w-2 bg-line')}
            />
          ))}
        </span>
        <Button
          variant="quiet"
          size="icon"
          aria-label="Next card"
          disabled={index >= count - 1}
          onClick={() => go(index + 1)}
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </section>
  );
}
