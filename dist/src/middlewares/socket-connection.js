import { createMiddleware } from "hono/factory";
let io;
export function setSocketIO(socketServer) {
    io = socketServer;
}
const ioMiddleware = createMiddleware(async (c, next) => {
    if (io) {
        c.set("io", io);
    }
    await next();
});
export { ioMiddleware };
