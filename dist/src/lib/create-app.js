import { pinoLogger } from "../middlewares/pino-logger.js";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { notFound, onError, serveEmojiFavicon } from "stoker/middlewares";
export function createRouter() {
    return new OpenAPIHono({
        strict: false,
    });
}
export function createProtectedRouter() {
    return new OpenAPIHono({
        strict: false,
    });
}
export default function createApp() {
    const app = createRouter();
    app.use(cors({ origin: "*" }));
    app.use(serveEmojiFavicon("😄"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
export function createTestApp(router) {
    return createApp().route("/", router);
}
