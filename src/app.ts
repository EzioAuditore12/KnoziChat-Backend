import configureOpenApi from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

import index from "@/routes/index.route";
import authRoutes from "./routes/auth/auth.index";
import user from "./routes/user/user.index";

configureOpenApi(app);

app.route("/", index);
app.route("/auth", authRoutes);
app.route("/user", user);

export default app;
