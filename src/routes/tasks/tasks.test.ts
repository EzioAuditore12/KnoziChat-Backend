import { describe, expect, it } from "vitest";

import { createTestApp } from "@/lib/create-app";

import { testClient } from "hono/testing";

import tasks from "./tasks.index";

describe("Tasks list", () => {
	it("responds with an array", async () => {
		const testRouter = createTestApp(tasks);
		const response = await testRouter.request("/tasks");
		expect(response.status).toBe(200);
		const result = await response.json();
		expect(Array.isArray(result)).toBe(true);
	});

	it("responds with an array", async () => {
		const testRouter = createTestApp(tasks);
		const client = testClient(testRouter);
		const response = await client.tasks.get;
		expect(response.status).toBe(200);
		const result = await response.json();
		expect(Array.isArray(result)).toBe(true);
	});
});
