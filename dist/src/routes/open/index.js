import { createRouter } from "../../lib/create-app.js";
import { OpenRequestHandlers } from "../../controllers/open/index.js";
import { getUserDetails, searchUserRoute } from "./search-user.route.js";
const open = createRouter().openapi(searchUserRoute, OpenRequestHandlers.searchUser)
    .openapi(getUserDetails, OpenRequestHandlers.getUserDetails);
export default open;
