import * as HTTPStatusPhrases from "stoker/http-status-phrases";
import { createMessageObjectSchema } from "stoker/openapi/schemas";

export const notFoundSchema = createMessageObjectSchema(
	HTTPStatusPhrases.NOT_FOUND,
);
