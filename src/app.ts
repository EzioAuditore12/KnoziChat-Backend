import configureOpenApi from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

import index from "@/routes/index.route";
import authRoutes from "./routes/auth";
import chats from "./routes/chats";
import open from "./routes/open";
import user from "./routes/user";

configureOpenApi(app);

//app.route("/", index);

app.get("/", (c) => {
	c.var.io.emit("hello", "world");
	return c.text("Hono!");
});

app.route("/open", open);
app.route("/auth", authRoutes);
app.route("/user", user);
app.route("/chat", chats);

export default app;
