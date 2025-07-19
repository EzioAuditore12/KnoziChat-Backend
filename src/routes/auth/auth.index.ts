import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.handler";
import * as routes from "./auth.routes";

const authentication = createRouter()
	.openapi(routes.registerUser, handlers.registerUser)
	.openapi(routes.loginUser, handlers.loginUser)
	.openapi(routes.verifyOtp, handlers.verifyOtp)
	.openapi(routes.regenerateRefreshToken, handlers.regenerateRefreshToken);

export default authentication;
