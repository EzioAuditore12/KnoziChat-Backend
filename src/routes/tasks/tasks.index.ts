import { createRouter } from "@/lib/create-app";

import * as handlers from "./tasks.handler";
import * as routes from "./tasks.routes";

const tasks = createRouter().openapi(routes.list, handlers.list);

export default tasks;
