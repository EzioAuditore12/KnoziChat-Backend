import configureOpenApi from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";

const app = createApp();

import index from "@/routes/index.route";
import authentication from "./routes/auth/auth.index";

const routes = [index, authentication];

configureOpenApi(app);

routes.forEach((route) => {
	app.route("/", route);
});

export default app;
