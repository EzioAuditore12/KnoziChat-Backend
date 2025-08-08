import { serve } from "@hono/node-server";
import app from "./app";
import env from "./env";

//Workers
import "@/jobs/sendEmail";
import "@/jobs/sendSMS";

const server = serve(
	{
		fetch: app.fetch,
		port: env.PORT,
	},
	(info) => {
		console.log(`Server is running: http://${info.address}:${info.port}`);
	},
);
