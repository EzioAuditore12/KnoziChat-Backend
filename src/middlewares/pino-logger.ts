import env from "@/config/env";
import { type PinoLogger, pinoLogger as logger } from "hono-pino";
import pino from "pino";
import pretty from "pino-pretty";

export function pinoLogger() {
	return logger({
		pino: pino(
			{
				level: env.LOG_LEVEL || "info",
			},
			env.NODE_ENV === "production" ? undefined : pretty(),
		),
		http: {
			reqId: () => crypto.randomUUID(),
		},
	});
}

export type { PinoLogger };
