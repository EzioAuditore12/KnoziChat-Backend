import { createMiddleware } from 'hono/factory';
import { Server as HttpServer } from 'node:http';
import type { Server } from 'socket.io';

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
        c.set('io', io);
    }
    await next();
});

export { ioMiddleware };