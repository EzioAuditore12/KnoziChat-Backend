import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { io } from 'socket.io-client';
import { faker } from '@faker-js/faker';

import { AppModule } from '../apps/app.module';
import { User } from '../apps/user/entities/user.entity';
import { TokenService } from '../apps/auth/services/tokens.service';

import type { Socket } from 'socket.io-client';

describe('Concurrent Sockets (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let tokenService: TokenService;

  const NUM_USERS = parseInt(process.env.TEST_NUM_USERS || '500', 10);
  const createdUsers: User[] = [];
  let sockets: Socket[] = [];

  beforeAll(async () => {
    jest.setTimeout(120000); // 2 minutes timeout for massive concurrency

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    await app.listen(0);

    userRepository = app.get(getRepositoryToken(User));
    tokenService = app.get(TokenService);

    console.log(`⏳ Generating ${NUM_USERS} dummy users...`);
    const usersToInsert: any[] = [];
    for (let i = 0; i < NUM_USERS; i++) {
      const firstName = faker.person.firstName();
      usersToInsert.push({
        firstName,
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        password: 'fake_password', // Hook is bypassed on insert()
        username: `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}${Math.floor(10000 + Math.random() * 90000)}`,
        middleName: null,
        phoneNumber: null,
        avatar: null,
        expoPushToken: null,
      });
    }

    // Bulk insert bypasses BeforeInsert hooks (like heavy argon2 hashing) for extreme speed!
    await userRepository.insert(usersToInsert);

    // Fetch them back to get their actual database IDs
    const usernames = usersToInsert.map((u) => u.username);

    const chunkSize = 500;
    for (let i = 0; i < usernames.length; i += chunkSize) {
      const chunk = usernames.slice(i, i + chunkSize);
      const fetched = await userRepository.find({
        where: { username: In(chunk) },
      });
      createdUsers.push(...fetched);
    }
  });

  afterAll(async () => {
    // Disconnect sockets
    sockets.forEach((s) => s.disconnect());

    // Rollback / delete created users
    if (createdUsers.length > 0 && userRepository) {
      await userRepository.delete(createdUsers.map((u) => u.id));
    }

    if (app) {
      await app.close();
    }
  });

  it(`should connect ${NUM_USERS} users concurrently`, (done) => {
    const port = app.getHttpServer().address().port;
    let connectedCount = 0;

    if (createdUsers.length === 0) {
      done(new Error('No users were created'));
      return;
    }

    for (let i = 0; i < createdUsers.length; i++) {
      const user = createdUsers[i];

      // Stagger connection attempts by 5ms to avoid overwhelming the local OS TCP stack
      setTimeout(() => {
        const tokens = tokenService.generateTokens(user.id, user.username);

        const socket = io(`http://127.0.0.1:${port}`, {
          auth: {
            token: tokens.accessToken,
          },
          transports: ['websocket'],
        });

        sockets.push(socket);

        socket.on('connect', () => {
          console.log(`✅ User connected: ${user.username} (${user.id})`);
          connectedCount++;
          if (connectedCount === NUM_USERS) {
            expect(connectedCount).toBe(NUM_USERS);
            console.log(`🎉 All ${NUM_USERS} users connected concurrently!`);
            done();
          }
        });

        socket.on('connect_error', (err) => {
          done(err);
        });
      }, i * 10); // 10ms stagger
    }
  }, 120000);
});
