const styleRules = [
  'Write every string for the speaker to read in a calm app.',
  'Use plain words.',
  'Keep every sentence at 20 words or fewer.',
  'Never use em dashes or en dashes. Use a period, a comma, or a colon.',
  'Never use these words: seamless, effortless, 10x, supercharge, game-changing.',
  'Never use all capital letters for emphasis.',
  'Every critique ends with one concrete action the speaker can take.',
  'Return only the fields the schema asks for.',
].join('\n');

export function systemPrompt(role: string) {
  return `${role}\n\nStyle rules:\n${styleRules}`;
}
