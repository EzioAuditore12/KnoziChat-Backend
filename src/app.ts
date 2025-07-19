import configureOpenApi from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

import index from "@/routes/index.route";
import authentication from "./routes/auth/auth.index";
import profile from "./routes/user/user.index";

configureOpenApi(app);

// Mount each router at its own base path
app.route("/", index);
app.route("/auth", authentication);
app.route("/api", profile);

export default app;
