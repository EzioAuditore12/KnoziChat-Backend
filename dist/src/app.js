import configureOpenApi from "./lib/configure-open-api.js";
import createApp from "./lib/create-app.js";
const app = createApp();
import authRoutes from "./routes/auth/index.js";
import chats from "./routes/chats/index.js";
import open from "./routes/open/index.js";
import user from "./routes/user/index.js";
configureOpenApi(app);
//app.route("/", index);
app.get('/', (c) => {
    c.var.io.emit('hello', 'world');
    return c.text('Hono!');
});
app.route("/open", open);
app.route("/auth", authRoutes);
app.route("/user", user);
app.route("/chat", chats);
export default app;
