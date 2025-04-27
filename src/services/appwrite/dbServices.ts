/* eslint-disable @typescript-eslint/no-explicit-any */
import { collections } from "./collections";
import { databaseId, databases } from "../../appwrite/config";
import { ID, Query, Models } from "appwrite";

const db: any = {};

collections.forEach((col) => {
  db[col.name] = {
    create: async (payload: any, id = ID.unique()) =>
      await databases.createDocument(databaseId, col.id, id, payload),

    update: async (id: string, payload: any) =>
      await databases.updateDocument(databaseId, col.id, id, payload),

    get: async (id: string) => await databases.getDocument(databaseId, col.id, id),

    list: async (queries: any[] = []) =>
      await databases.listDocuments(databaseId, col.id, queries),

    delete: async (id: string) =>
      await databases.deleteDocument(databaseId, col.id, id),
  };
});

export default db;