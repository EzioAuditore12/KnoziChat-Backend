import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
import { requestId } from "hono/request-id";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
import { defaultHook } from "stoker/openapi";

import type {
	AppBindings,
	AppOpenAPI,
	AuthenticatedAppBindings,
} from "./types";

export function createRouter() {
	return new OpenAPIHono<AppBindings>({
		strict: false,
		defaultHook,
	});
}

export function createProtectedRouter() {
	return new OpenAPIHono<AuthenticatedAppBindings>({
		strict: false,
		defaultHook,
	});
}

export default function createApp() {
	const app = createRouter();

	app.use(requestId()).use(pinoLogger()).use(serveEmojiFavicon("😄"));

	app.notFound(notFound);
	app.onError(onError);

	return app;
}

export function createTestApp(router: AppOpenAPI) {
	const testApp = createApp();
	testApp.route("/", router);
	return testApp;
}
