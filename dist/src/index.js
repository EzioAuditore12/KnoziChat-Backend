import { serve } from "@hono/node-server";
import app from "./app.js";
import env from "./env.js";
import { initWebSocket } from "./lib/init-websocket.js";
//Workers
import "./jobs/sendEmail.js";
import "./jobs/sendSMS.js";
import { ioMiddleware } from "./middlewares/socket-connection.js";
const server = serve({
    fetch: app.fetch,
    port: env.PORT,
}, (info) => {
    console.log(`Server is running: http://${info.address}:${info.port}`);
});
initWebSocket(server);
app.use(ioMiddleware);
