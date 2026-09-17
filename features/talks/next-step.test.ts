import { describe, expect, it } from 'vitest';
import { describeNextStep } from './next-step';

const sections = [{ id: 'part-2', title: 'Part 2' }];

describe('describeNextStep', () => {
  it('names the day and the next session', () => {
    expect(
      describeNextStep({
        startsAt: '2026-09-17T14:00',
        today: '2026-09-15',
        pick: { kind: 'full-run', sectionId: null, minutes: 12, sessionId: 's1', reason: 'planned' },
        sections,
        debriefed: false,
      }),
    ).toEqual({ when: 'Thursday', task: 'Full run, 12 minutes', action: 'practice' });
  });

  it('names the section for a loop', () => {
    const step = describeNextStep({
      startsAt: '2026-09-15T18:00',
      today: '2026-09-15',
      pick: { kind: 'section-loop', sectionId: 'part-2', minutes: 9, sessionId: null, reason: 'weak-section' },
      sections,
      debriefed: false,
    });
    expect(step.task).toBe('Loop part 2, 9 minutes');
    expect(step.when).toBe('Today');
  });

  it('sends the talk-day checklist to present', () => {
    const step = describeNextStep({
      startsAt: '2026-09-15T18:00',
      today: '2026-09-15',
      pick: { kind: 'talk-day-checklist', sectionId: null, minutes: 30, sessionId: 's9', reason: 'planned' },
      sections,
      debriefed: false,
    });
    expect(step).toEqual({ when: 'Today', task: 'Talk-day routine, 30 minutes', action: 'present' });
  });

  it('asks for a debrief after the talk', () => {
    const pick = {
      kind: 'full-run' as const,
      sectionId: null,
      minutes: 12,
      sessionId: null,
      reason: 'default' as const,
    };
    expect(
      describeNextStep({ startsAt: '2026-09-14T09:00', today: '2026-09-15', pick, sections, debriefed: false }),
    ).toEqual({ when: 'Yesterday', task: 'Debrief, 1 minute', action: 'debrief' });
    expect(
      describeNextStep({ startsAt: '2026-09-14T09:00', today: '2026-09-15', pick, sections, debriefed: true }).action,
    ).toBe('done');
  });
});
