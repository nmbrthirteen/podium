import { z } from 'zod';

export function toCliJsonSchema(schema: z.ZodType) {
  const json = z.toJSONSchema(schema, { io: 'output' });
  return Object.fromEntries(Object.entries(json).filter(([key]) => key !== '$schema'));
}
