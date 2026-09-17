import { describe, expect, it } from 'vitest';
import { briefRules, endsWeak, startsWeak } from './rules';

const cleanBrief = {
  bigIdea: 'Rehearse out loud so recall holds under stress',
  openingLine: 'Half of speakers blank in the first two minutes.',
  closingLine: 'Book three spoken runs before your next talk.',
  points: [{ id: 'p1', text: 'Recall beats rereading', example: 'Science 2016 stress study' }],
};

describe('briefRules', () => {
  it('passes a clean brief', () => {
    expect(briefRules(cleanBrief)).toEqual([]);
  });

  it('flags a big idea over 15 words', () => {
    const bigIdea = Array.from({ length: 22 }, (_, index) => `word${index}`).join(' ');
    const [issue] = briefRules({ ...cleanBrief, bigIdea });
    expect(issue?.message).toBe('Your big idea has 22 words. Cut it to 15 or fewer.');
    expect(issue?.action).toEqual({ kind: 'focus', target: 'field-bigIdea', label: 'Edit big idea' });
  });

  it('allows exactly 15 words', () => {
    const bigIdea = Array.from({ length: 15 }, () => 'word').join(' ');
    expect(briefRules({ ...cleanBrief, bigIdea })).toEqual([]);
  });

  it('flags more than 3 points', () => {
    const points = Array.from({ length: 5 }, (_, index) => ({ id: `p${index}`, text: 'Point', example: '42%' }));
    const [issue] = briefRules({ ...cleanBrief, points });
    expect(issue?.message).toBe('You have 5 points. Audiences trust 3. Merge or cut two.');
    expect(issue?.action.kind).toBe('open');
  });

  it('flags a point without an example', () => {
    const [issue] = briefRules({ ...cleanBrief, points: [{ id: 'p9', text: 'Point', example: ' ' }] });
    expect(issue?.message).toBe('This point has no example or number.');
    expect(issue?.action).toEqual({ kind: 'focus', target: 'point-example-p9', label: 'Add an example' });
  });

  it.each([
    'Thank you all for coming.',
    'Thanks for having me',
    'Hi everyone, great to be here',
    'Good morning, everyone',
    'My name is Sam and I lead growth',
    "I'm Sam and I run design",
    'Here is our agenda for today',
    'Agenda: three things',
    "Today we'll cover three things",
  ])('flags the weak opening "%s"', openingLine => {
    const [issue] = briefRules({ ...cleanBrief, openingLine });
    expect(issue?.message).toBe(
      'Openings that thank or list an agenda lose attention. Start with a fact, question, or story.',
    );
    expect(issue?.action).toEqual({ kind: 'focus', target: 'field-openingLine', label: 'Edit opening' });
  });

  it.each(['Thank you.', 'Any questions?', 'So that is it. Thanks!', 'Happy to take questions'])(
    'flags the weak closing "%s"',
    closingLine => {
      const [issue] = briefRules({ ...cleanBrief, closingLine });
      expect(issue?.message).toBe('End on your big idea or your ask.');
      expect(issue?.action).toEqual({ kind: 'focus', target: 'field-closingLine', label: 'Edit closing' });
    },
  );

  it('does not flag strong openings and closings', () => {
    expect(startsWeak('Hiring slowed 40% this quarter.')).toBe(false);
    expect(startsWeak('Think about the last time you blanked.')).toBe(false);
    expect(endsWeak('Approve the budget by Friday.')).toBe(false);
  });
});
