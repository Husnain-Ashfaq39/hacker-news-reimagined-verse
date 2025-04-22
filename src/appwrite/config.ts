import { Client, Account, ID } from "appwrite";

// Initialize the Appwrite client
const client = new Client()
  .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
  .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// Initialize and export the account service
const account = new Account(client);

export { client, account, ID };
