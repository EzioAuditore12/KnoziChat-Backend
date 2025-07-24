import { pinoLogger } from "@/middlewares/pino-logger";
import { OpenAPIHono } from "@hono/zod-openapi";
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
    app.use(serveEmojiFavicon("😄"));
    app.use(pinoLogger());
    app.notFound(notFound);
    app.onError(onError);
    return app;
}
export function createTestApp(router) {
    return createApp().route("/", router);
}
