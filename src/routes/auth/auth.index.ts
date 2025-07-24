import { createRouter } from "@/lib/create-app";

import { loginHandler, loginRoute } from "./login/login.index";
import {
	regenerateTokensHandler,
	regenerateTokensRoute,
} from "./regenerateTokens/regenerateTokens.index";
import { registerHandler, registerRoute } from "./registeration/register.index";

const authRoutes = createRouter()
	.openapi(registerRoute.registerUserForm, registerHandler.registerUserForm)
	.openapi(registerRoute.validateRegisterOTP,registerHandler.validateRegisterationOTP)
	.openapi(loginRoute.loginUser, loginHandler.loginUser)
	.openapi(
		regenerateTokensRoute.regenerateTokens,
		regenerateTokensHandler.regenerateTokens,
	);

export default authRoutes;
