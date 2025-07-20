import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { HTTPStatusCode } from "@/lib/constants";
import { createTestApp } from "@/lib/create-app";
import { generateHashedPassword } from "@/utils/crypto-password";
import { eq } from "drizzle-orm";
import { testClient } from "hono/testing";
import { beforeAll, describe, expect, it } from "vitest";
import authRoutes from "../auth.index";

const email = "test@example.com";
const password = "Test@1234!";

beforeAll(async () => {
	// Clean and seed the test user
	await db.delete(usersTable).where(eq(usersTable.email, email));
	await db.insert(usersTable).values({
		email,
		firstName: "Test",
		lastName: "User",
		password: await generateHashedPassword(password),
	});
});

const client = testClient(createTestApp(authRoutes));

describe("POST /login", () => {
	it("should login with correct credentials", async () => {
		const response = await client.login.$post({
			json: { email, password },
		});
		expect(response.status).toBe(HTTPStatusCode.OK);
	});

	it("should fail with wrong password", async () => {
		const response = await client.login.$post({
			json: { email, password: "wrongpass" },
		});
		expect(response.status).toBe(HTTPStatusCode.UNAUTHORIZED);
	});

	it("should fail with unregistered email", async () => {
		const response = await client.login.$post({
			json: { email: "notfound@example.com", password },
		});
		expect(response.status).toBe(HTTPStatusCode.NOT_FOUND);
	});
});
