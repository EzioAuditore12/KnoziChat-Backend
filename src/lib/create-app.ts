import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import type { Schema } from "hono";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";

import type { AppBindings, AppOpenAPI } from "./types";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
	});
}

export default function createApp() {
	const app = createRouter();

	app.use(serveEmojiFavicon("😄"));
	app.use(pinoLogger());

	app.notFound(notFound);
	app.onError(onError);

	return app;
}

export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
	return createApp().route("/", router);
}
