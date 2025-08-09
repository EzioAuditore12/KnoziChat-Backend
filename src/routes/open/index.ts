import { createRouter } from "@/lib/create-app";

import { OpenRequestHandlers } from "@/controllers/open";
import { getUserDetails, searchUserRoute } from "./search-user.route";

const open = createRouter().openapi(
	searchUserRoute,
	OpenRequestHandlers.searchUser,
)
.openapi(getUserDetails,OpenRequestHandlers.getUserDetails)
;

export default open;
