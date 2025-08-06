import { z } from "@hono/zod-openapi";
import * as HTTPStatusCodes from "stoker/http-status-codes";
import * as HTTPStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const HTTPStatusCode = HTTPStatusCodes;

export const notFoundSchema = createMessageObjectSchema(
	HTTPStatusPhrases.NOT_FOUND,
);

export const tooManyRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.TOO_MANY_REQUESTS,
)
	.extend({
		seconds: z.number().int().positive().describe("Seconds until retry"),
	})
	.strict();

export const unauthorizedRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.UNAUTHORIZED,
);

export const conflictRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.CONFLICT,
);

export const forbiddenRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.FORBIDDEN,
);

export const notAcceptedRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.NOT_ACCEPTABLE,
);

export const badRequestSchema = createMessageObjectSchema(
	HTTPStatusPhrases.BAD_REQUEST,
);
