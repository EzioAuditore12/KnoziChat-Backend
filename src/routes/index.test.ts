import { execSync } from "node:child_process";
import fs from "node:fs";
import env from "@/env";
import { testClient } from "hono/testing";
import * as HttpStatusPhrases from "stoker/http-status-phrases";
import {
	afterAll,
	beforeAll,
	describe,
	expect,
	expectTypeOf,
	it,
} from "vitest";

import { HTTPStatusCode } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";
import router from "./index.route";

const client = testClient(createTestApp(router));

describe("Basic basic router", () => {
	it("should return 200 OK for GET /", async () => {
		const response = await client.index.$get();
		expect(response.status).toBe(HTTPStatusCode.OK);
	});

	it("should return JSON content-type for GET /", async () => {
		const response = await client.index.$get();
		expect(response.headers.get("content-type")).toContain("application/json");
	});

	it("should return a valid response body for GET /", async () => {
		const response = await client.index.$get();
		const body = await response.json();
		expect(body).toBeDefined();
		expect(typeof body).toBe("object");
	});
});
