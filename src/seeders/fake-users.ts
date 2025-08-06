import { db } from "@/db"; // adjust import to your db instance
import { usersTable } from "@/db/models/users.model";
import { faker } from "@faker-js/faker";

async function seedUsers(count = 10) {
	const users = Array.from({ length: count }).map(() => ({
		firstName: faker.person.firstName(),
		lastName: faker.person.lastName(),
		email: faker.internet.email(),
		phoneNumber: faker.phone.number({ style: "national" }).slice(0, 20),
		password: faker.internet.password(),
		profilePicture: faker.image.avatar(),
		bio: faker.lorem.sentence(),
	}));

	await db.insert(usersTable).values(users);
	console.log(`${count} users inserted!`);
}

seedUsers(20).then(() => process.exit(0));
