import { serve } from "@hono/node-server";
import app from "./app";
import env from "./env";
import { initWebSocket } from "./lib/init-websocket";

//Workers
import "@/jobs/sendEmail";
import "@/jobs/sendSMS";
import { ioMiddleware } from "./middlewares/socket-connection";

const server = serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		console.log(`Server is running: http://${info.address}:${info.port}`);
	},
);

initWebSocket(server);

app.use(ioMiddleware);
