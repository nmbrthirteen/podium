import { cn } from '@/lib/utils';

export type SegmentState = 'done' | 'current' | 'todo';
export type Segment = { id: string; weight: number; state: SegmentState };

const stateClass: Record<SegmentState, string> = {
  done: 'bg-muted',
  current: 'bg-accent',
  todo: 'bg-line',
};

export function sectionSegments(sections: { id: string; minutes: number }[], currentIndex: number): Segment[] {
  return sections.map((section, index) => ({
    id: section.id,
    weight: Math.max(section.minutes, 0.1),
    state: index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'todo',
  }));
}

export function SegmentBar({ segments, label, className }: { segments: Segment[]; label: string; className?: string }) {
  return (
    <div role="img" aria-label={label} className={cn('flex h-1 gap-0.5', className)}>
      {segments.map(segment => (
        <span key={segment.id} className={stateClass[segment.state]} style={{ flexGrow: segment.weight }} />
      ))}
    </div>
  );
}
