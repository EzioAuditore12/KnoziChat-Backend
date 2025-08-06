import { createRouter } from "@/lib/create-app";
import {
	searchUserHandler,
	searchUserRoutes,
} from "./search-user/search-user.index";

const open = createRouter().openapi(
	searchUserRoutes.searchUser,
	searchUserHandler.searchUser,
);

export default open;
