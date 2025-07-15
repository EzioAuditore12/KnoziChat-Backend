import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.handler";
import * as routes from "./auth.routes";

const authentication = createRouter()
	.openapi(routes.registerUser, handlers.registerUser)
	.openapi(routes.loginUser, handlers.loginUser);

export default authentication;
