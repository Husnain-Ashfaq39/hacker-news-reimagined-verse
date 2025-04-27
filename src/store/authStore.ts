/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { authService } from '@/services/appwrite/auth.service';
import { Models } from 'appwrite';
import db from '@/services/appwrite/dbServices';
import { Query } from '@/appwrite/config';



interface AuthState {
  user: any // User data from the Users collection
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  checkUserSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  
  signInWithGoogle: async () => {
    try {
      await authService.signInWithGoogle();
      // The page will redirect to Google OAuth, so we don't need to set the user here
    } catch (error) {
      console.error("Sign in with Google failed:", error);
      throw error;
    }
  },
  
  signOut: async () => {
    try {
      await authService.signOut();
      set({  user: null });
    } catch (error) {
      console.error("Sign out failed:", error);
      throw error;
    }
  },
  
  checkUserSession: async () => {
    try {
      // Get Appwrite user
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        // Try to find user in the Users collection
        try {
          const userList = await db.Users.list([
            Query.equal('email', currentUser.email)
          ]);
          
          if (userList.documents && userList.documents.length > 0) {
            // User exists in database
            set({ 
             
              user: userList.documents[0], 
              isLoading: false 
            });
          } else {
            // User authenticated but not in database, store user data
            const storedUser = await authService.storeUserData();
            set({ 
             
              user: storedUser, 
              isLoading: false 
            });
          }
        } catch (dbError) {
          console.error("Failed to get user from database:", dbError);
          set({ 
           
            user: null, 
            isLoading: false 
          });
        }
      } else {
        // No user logged in
        set({  user: null, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to get user session:", error);
      set({  user: null, isLoading: false });
    }
  }
})); 