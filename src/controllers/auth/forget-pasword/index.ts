import { changeUserPasswordWithLogin } from "./change-password";
import { forgotPasswordTrigger } from "./trigger-forget-request";
import { verifyChangeUserPasswordRequest } from "./verify-forget-request";

export const ForgotPasswordRequestHandlers = {
	forgotPasswordTrigger,
	verifyChangeUserPasswordRequest,
	changeUserPasswordWithLogin,
};
