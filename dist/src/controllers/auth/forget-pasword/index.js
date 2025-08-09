import { changeUserPasswordWithLogin } from "./change-password.js";
import { forgotPasswordTrigger } from "./trigger-forget-request.js";
import { verifyChangeUserPasswordRequest } from "./verify-forget-request.js";
export const ForgotPasswordRequestHandlers = {
    forgotPasswordTrigger,
    verifyChangeUserPasswordRequest,
    changeUserPasswordWithLogin,
};
