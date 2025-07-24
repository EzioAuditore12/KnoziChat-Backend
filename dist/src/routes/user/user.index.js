import { createProtectedRouter } from "@/lib/create-app";
import { userDetailsHandler, userDetailsRoute, } from "./userDetails/userDetails.index";
const user = createProtectedRouter().openapi(userDetailsRoute.getUserDetails, userDetailsHandler.userProfile);
export default user;
