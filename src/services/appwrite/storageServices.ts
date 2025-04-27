/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/storageServices.js
import { buckets } from "./buckets";
import { storage } from "../../appwrite/config"; // Ensure you have initialized Appwrite client and storage service
import { ID } from "appwrite";

const storageServices: any = {};

buckets.forEach((bucket) => {
  storageServices[bucket.name] = {
    createFile: async (file: any, id = ID.unique()) =>
      await storage.createFile(bucket.id, id, file),

    deleteFile: async (id: string) => await storage.deleteFile(bucket.id, id),

    getFile: async (id: string) => await storage.getFile(bucket.id, id),

    getFileDownload: async (id: string) => {
      return await storage.getFileDownload(bucket.id, id);
    },

    getFilePreview: (id: string, options?: any) => storage.getFilePreview(bucket.id, id, options),

    getFileView: (id: string) => storage.getFileView(bucket.id, id),

    listFiles: async (queries?: any) => await storage.listFiles(bucket.id, queries),

    updateFile: async (id: string, file: any) =>
      await storage.updateFile(bucket.id, id, file),
  };
});

export default storageServices;