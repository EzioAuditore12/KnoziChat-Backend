import type { Context } from "hono";

export const emitEvent = (
	c: Context,
	event: string,
	users: string[] | null,
	data: string | object,
) => {
	console.log("Emitting evenet", event);
};
