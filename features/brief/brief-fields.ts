export const briefTextFields = [
  'goal',
  'audience',
  'bigIdea',
  'openingLine',
  'closingLine',
  'recoveryLine',
  'backPocketQuestion',
] as const;

export type BriefTextField = (typeof briefTextFields)[number];
