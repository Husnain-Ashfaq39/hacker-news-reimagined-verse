import { Client, Account, ID, Databases, Storage } from "appwrite";
import { Query } from 'appwrite';
// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize and export the account service
const account = new Account(client);

// Initialize database service
const databases = new Databases(client);
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID;

// Initialize storage service
const storage = new Storage(client);

export { client, account, ID, databases, databaseId, storage,Query };
