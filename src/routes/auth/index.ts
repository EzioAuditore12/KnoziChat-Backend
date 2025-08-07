import { createRouter } from "@/lib/create-app";

import { ForgotPasswordRequestHandlers } from "@/controllers/auth/forget-pasword";
import { ForgotPasswordRoutes } from "./forget-password.routes";

import { RegisterUserHandlers } from "@/controllers/auth/register";
import { RegisterUserRoutes } from "./register.route";

import { LoginUserHandlers } from "@/controllers/auth/login";
import { LoginUserRoutes } from "./login.route";

import { RegenerateTokensHandler } from "@/controllers/auth/regenerate-tokens";
import { RegenerateTokens } from "./regenerateTokens.route";

const authRoutes = createRouter()
	.openapi(
		RegisterUserRoutes.registerUserForm,
		RegisterUserHandlers.registerUserForm,
	)
	.openapi(
		RegisterUserRoutes.validateRegisterOTP,
		RegisterUserHandlers.validateRegisterationOTP,
	)
	.openapi(LoginUserRoutes.loginUser, LoginUserHandlers.loginUser)
	.openapi(
		ForgotPasswordRoutes.forgetPasswordTrigger,
		ForgotPasswordRequestHandlers.forgotPasswordTrigger,
	)
	.openapi(
		ForgotPasswordRoutes.verifychangeUserPasswordRequest,
		ForgotPasswordRequestHandlers.verifyChangeUserPasswordRequest,
	)
	.openapi(
		ForgotPasswordRoutes.changeUserPasswordWithLogin,
		ForgotPasswordRequestHandlers.changeUserPasswordWithLogin,
	)
	.openapi(RegenerateTokens, RegenerateTokensHandler);

export default authRoutes;
