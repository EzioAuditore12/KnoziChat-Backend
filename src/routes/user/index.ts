import { createProtectedRouter } from "@/lib/create-app";

import { UserRequestHandlers } from "@/controllers/user";
import { UserRoutes } from "./user.route";

const user = createProtectedRouter()
	.openapi(UserRoutes.getUserDetails, UserRequestHandlers.userProfile)
	.openapi(
		UserRoutes.updateUserProfilePhoto,
		UserRequestHandlers.updateUserProfilePhoto,
	);

export default user;
