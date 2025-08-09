import { createRouter } from "../../lib/create-app.js";
import { ForgotPasswordRequestHandlers } from "../../controllers/auth/forget-pasword/index.js";
import { ForgotPasswordRoutes } from "./forget-password.routes.js";
import { RegisterUserHandlers } from "../../controllers/auth/register/index.js";
import { RegisterUserRoutes } from "./register.route.js";
import { LoginUserHandlers } from "../../controllers/auth/login/index.js";
import { LoginUserRoutes } from "./login.route.js";
import { RegenerateTokensHandler } from "../../controllers/auth/regenerate-tokens/index.js";
import { RegenerateTokens } from "./regenerateTokens.route.js";
const authRoutes = createRouter()
    .openapi(RegisterUserRoutes.registerUserForm, RegisterUserHandlers.registerUserForm)
    .openapi(RegisterUserRoutes.validateRegisterOTP, RegisterUserHandlers.validateRegisterationOTP)
    .openapi(LoginUserRoutes.loginUser, LoginUserHandlers.loginUser)
    .openapi(ForgotPasswordRoutes.forgetPasswordTrigger, ForgotPasswordRequestHandlers.forgotPasswordTrigger)
    .openapi(ForgotPasswordRoutes.verifychangeUserPasswordRequest, ForgotPasswordRequestHandlers.verifyChangeUserPasswordRequest)
    .openapi(ForgotPasswordRoutes.changeUserPasswordWithLogin, ForgotPasswordRequestHandlers.changeUserPasswordWithLogin)
    .openapi(RegenerateTokens, RegenerateTokensHandler);
export default authRoutes;
