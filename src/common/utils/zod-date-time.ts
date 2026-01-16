import { z } from 'zod';

/**
 * Override the JSON Schema for a Zod parser.
 */
export function overrideJSONSchema<T>(
  parser: z.ZodType<T>,
  customJSONSchema: unknown,
): z.ZodType<T> {
  // @ts-expect-error: Accessing Zod internals for workaround
  parser._def.openapi = { schema: customJSONSchema };
  return parser;
}

/**
 * Zod type that accepts Date or ISO string, coerces to Date, and outputs correct OpenAPI schema.
 */
export function dateTime(): z.ZodType<Date> {
  return overrideJSONSchema(
    z.union([
      z.date(),
      z
        .string()
        .datetime()
        .transform((val) => new Date(val)),
    ]),
    { type: 'string', format: 'date-time' },
  );
}
