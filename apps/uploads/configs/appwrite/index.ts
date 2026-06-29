import { env } from 'apps/env';
import { Client, Storage, Tokens, Users } from 'node-appwrite';

const appWriteClient = new Client();

appWriteClient
  .setEndpoint(env.APPWRITE_END_POINT)
  .setProject(env.APPWRITE_PROJECT_ID)
  .setKey(env.APPWRITE_API_KEY);

const storage = new Storage(appWriteClient);

const users = new Users(appWriteClient);

export const tokens = new Tokens(appWriteClient);

export default appWriteClient;

export {
  storage as appWriteStorage,
  users as appWriteUsers,
  tokens as appWriteTokens,
};
