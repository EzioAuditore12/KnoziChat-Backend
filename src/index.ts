import app from "./app";

const server = Bun.serve({
	port: process.env.PORT,
	fetch: app.fetch,
});

console.log("Server running", server.port);
