export type CardSection = {
  id: string;
  title: string;
  minutes: number;
  keywords: string[];
  verbatim: string;
  slideNumbers: number[];
};

export function slideLabel(numbers: number[]) {
  if (numbers.length === 0) return '';
  return numbers.length === 1 ? `Slide ${numbers[0]}` : `Slides ${numbers.join(', ')}`;
}
