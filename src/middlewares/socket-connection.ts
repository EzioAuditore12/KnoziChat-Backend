import { createMiddleware } from "hono/factory";
import type { Server } from "socket.io";

let io: Server;

export function setSocketIO(socketServer: Server) {
    io = socketServer;
}

const ioMiddleware = createMiddleware<{
    Variables: {
        io: Server;
    };
}>(async (c, next) => {
    if (io) {
        c.set("io", io);
    } else {
        console.warn("Socket.IO instance not initialized");
    }
    await next();
});

export { ioMiddleware };
