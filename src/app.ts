import configureOpenApi from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

import index from "@/routes/index.route";
import authRoutes from "./routes/auth/auth.index";
import chats from "./routes/chats/chats.index";
import open from "./routes/open/open.index";
import user from "./routes/user/user.index";

configureOpenApi(app);

app.route("/", index);
app.route("/open", open);
app.route("/auth", authRoutes);
app.route("/user", user);
app.route("/chat", chats);

export default app;
