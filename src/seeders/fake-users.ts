import { db } from "@/db";
import { usersTable } from "@/db/models/users.model";
import { faker } from "@faker-js/faker";
import { hash } from "bcrypt";

async function seedUsers(count = 10) {
	const users = await Promise.all(
		Array.from({ length: count }).map(async () => ({
			firstName: faker.person.firstName(),
			lastName: faker.person.lastName(),
			email: faker.internet.email(),
			phoneNumber: faker.phone.number({ style: "national" }).slice(0, 20),
			password: await hash(faker.internet.password(), 10), // bcrypt hash
			profilePicture: faker.image.avatar(),
			bio: faker.lorem.sentence(),
		})),
	);

	await db.insert(usersTable).values(users);
	console.log(`${count} users inserted!`);
}

seedUsers(20).then(() => process.exit(0));
