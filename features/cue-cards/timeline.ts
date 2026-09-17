export const minuteStep = 0.5;

const round = (value: number) => Math.round(value * 100) / 100;

export function moveBoundary(minutes: number[], boundary: number, delta: number): number[] {
  const left = minutes[boundary];
  const right = minutes[boundary + 1];
  if (left === undefined || right === undefined) return minutes;

  const pair = left + right;
  if (pair < minuteStep * 2) return minutes;

  const snapped = Math.round((left + delta) / minuteStep) * minuteStep;
  const nextLeft = round(Math.min(Math.max(snapped, minuteStep), pair - minuteStep));
  if (nextLeft === left) return minutes;

  return minutes.map((value, index) => {
    if (index === boundary) return nextLeft;
    if (index === boundary + 1) return round(pair - nextLeft);
    return value;
  });
}

export function formatShortMinutes(minutes: number) {
  return `${Math.round(minutes * 10) / 10} min`;
}
