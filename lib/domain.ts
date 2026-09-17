export const talkTypes = [
  'exec-update',
  'team-meeting',
  'pitch',
  'conference-talk',
  'lecture',
  'workshop',
  'webinar',
  'all-hands',
  'interview-panel',
] as const;
export type TalkType = (typeof talkTypes)[number];

export const depths = ['quick', 'standard', 'deep'] as const;
export type Depth = (typeof depths)[number];

export const stakesLevels = ['low', 'normal', 'high'] as const;
export type Stakes = (typeof stakesLevels)[number];

export const sessionKinds = [
  'full-run',
  'section-loop',
  'open-close-drill',
  'mental-walkthrough',
  'recorded-run',
  'listener-run',
  'qa-drill',
  'dress-rehearsal',
  'talk-day-checklist',
] as const;
export type SessionKind = (typeof sessionKinds)[number];

export const fieldSources = ['user', 'coach-draft', 'deck'] as const;
export type FieldSource = (typeof fieldSources)[number];

export const briefFields = [
  'title',
  'goal',
  'audience',
  'bigIdea',
  'type',
  'openingLine',
  'closingLine',
  'recoveryLine',
  'backPocketQuestion',
] as const;
export type BriefField = (typeof briefFields)[number];
export type FieldSources = Partial<Record<BriefField, FieldSource>>;

export type QuestionSource = 'predicted' | 'drill' | 'received';
export type DeckKind = 'pptx' | 'pdf';

export type SectionTiming = {
  sectionId: string;
  seconds: number;
  budgetSeconds: number;
  peeks: number;
};

const planIds = ['free', 'pro'] as const;
export type PlanId = (typeof planIds)[number];

export const usageKinds = ['coach-call', 'deck-upload', 'recording-mb'] as const;
export type UsageKind = (typeof usageKinds)[number];

const subscriptionStatuses = ['active', 'past-due', 'canceled'] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];
