import { createRouter } from "@/lib/create-app";

import * as handlers from "./tasks.handler";
import * as routes from "./tasks.routes";

const tasks = createRouter()
	.openapi(routes.list, handlers.list)
	.openapi(routes.create, handlers.create)
	.openapi(routes.getOne, handlers.getOne)
	.openapi(routes.patch, handlers.path);

export default tasks;
