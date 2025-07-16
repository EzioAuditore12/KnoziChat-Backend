import { createProtectedRouter } from "@/lib/create-app";

import * as handlers from "./user.handler";
import * as routes from "./user.routes";

const profile = createProtectedRouter().openapi(
	routes.userProfile,
	handlers.userProfile,
);

export default profile;
