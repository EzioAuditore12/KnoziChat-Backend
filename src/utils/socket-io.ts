import type { Context } from "hono";

export const emitEvent = (
	c: Context,
	event: string,
	users: string[],
	data: string,
) => {
	console.log("Emitting evenet", event);
};
