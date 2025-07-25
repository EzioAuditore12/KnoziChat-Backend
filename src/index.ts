import app from "./app";
import env from "./env";

//Workers
import "@/jobs/sendEmail";

const server = Bun.serve({
	port: env.PORT,
	fetch: app.fetch,
});

console.log("Server running", server.port);
