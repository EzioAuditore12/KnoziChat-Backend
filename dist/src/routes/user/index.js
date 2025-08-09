import { createProtectedRouter } from "../../lib/create-app.js";
import { UserRequestHandlers } from "../../controllers/user/index.js";
import { UserRoutes } from "./user.route.js";
const user = createProtectedRouter()
    .openapi(UserRoutes.getUserDetails, UserRequestHandlers.userProfile)
    .openapi(UserRoutes.updateUserProfilePhoto, UserRequestHandlers.updateUserProfilePhoto);
export default user;
