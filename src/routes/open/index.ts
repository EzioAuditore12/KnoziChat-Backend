import { createRouter } from "@/lib/create-app";

import { OpenRequestHandlers } from "@/controllers/open";
import { searchUserRoute } from "./search-user.route";

const open = createRouter().openapi(
	searchUserRoute,
	OpenRequestHandlers.searchUser,
);

export default open;
