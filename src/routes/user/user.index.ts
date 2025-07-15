import { createRouter } from "@/lib/create-app";

import * as handlers from "./user.handler"
import * as routes from "./user.routes"

const profile=createRouter()
.openapi(routes.userProfile,handlers.userProfile)

export default profile
