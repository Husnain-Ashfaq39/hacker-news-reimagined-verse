import { account,Query } from "@/appwrite/config";
import { OAuthProvider } from "appwrite";
import db from "./dbServices";
import storageServices from "./storageServices";
import { ID } from "appwrite";

class AuthService {
  // Google OAuth sign-in/sign-up
  async signInWithGoogle() {
    try {
      // Get the current URL for the redirect
      const currentUrl = window.location.href;

      // Create OAuth session with Google
      const promise = account.createOAuth2Session(
        OAuthProvider.Google,
        currentUrl, // Success URL (same page)
        currentUrl, // Failure URL (same page)
        ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'] // Scopes
      );

      return promise;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }

  // Store user data after login
  async storeUserData() {
    try {
      // Get current user
      const user = await this.getCurrentUser();
      
      if (!user) {
        throw new Error("No user logged in");
      }

      // Check if user already exists in database
      try {
        const existingUser = await db.Users.list([
          Query.equal('email', user.email)
        ]);
        
        // If user already exists, no need to create a new record
        if (existingUser.documents && existingUser.documents.length > 0) {
          console.log("User already exists in database, skipping creation");
          return existingUser.documents[0];
        }
      } catch (error) {
        console.error("Error checking for existing user:", error);
        // Continue with creating a new user
      }

      console.log("Creating new user in database");
      
      // User doesn't exist, proceed with creating a new user record
      
      // Step 1: Store profile picture if available
      let profileUrl = "";
      console.log("User data:", user);
      
      if (user.prefs?.avatar) {
        console.log("Avatar URL found:", user.prefs.avatar);
        try {
          // Create a deterministic ID based on user email to prevent duplicates
          const userId = `user_${user.email.replace(/[^a-zA-Z0-9]/g, "_")}`;
          
          // Check if we already have a profile photo for this user
          try {
            // Try to get the file directly using the deterministic ID
            const existingFile = await storageServices.images.getFile(userId);
            profileUrl = await storageServices.images.getFileDownload(existingFile.$id);
            console.log("Using existing profile photo:", profileUrl);
          } catch (fileError) {
            // File doesn't exist, upload a new one
            console.log("No existing profile photo found, uploading new one");
            
            // Fetch user info from Google API
            const response = await fetch(user.prefs.avatar);
            const userData = await response.json();
            console.log("Google user data:", userData);
            
            if (userData.picture) {
              // Fetch the actual image
              const imageResponse = await fetch(userData.picture);
              const blob = await imageResponse.blob();
              
              // Create a File object from the blob
              const avatarFile = new File([blob], `${user.name}-profile.${blob.type.split('/')[1] || 'png'}`, {
                type: blob.type,
              });
              console.log("Created avatar File object:", avatarFile);
              
              // Upload to storage with user's email as metadata
              console.log("Attempting to upload to storage...");
              const uploadedFile = await storageServices.images.createFile(
                avatarFile,
                userId
              );
              console.log("Storage upload response:", uploadedFile);
              
              // Get file URL
              console.log("Getting file download URL...");
              profileUrl = await storageServices.images.getFileDownload(uploadedFile.$id);
            }
          }
        } catch (imageError) {
          console.error("Error uploading profile image:", imageError);
          console.error("Error details:", {
            name: imageError.name,
            message: imageError.message,
            stack: imageError.stack
          });
          // Continue even if image upload fails
        }
      }
      
      // Step 2: Store user data in database
      const userData = {
        name: user.name,
        email: user.email,
        profile_url: profileUrl,
      };
      
      const createdUser = await db.Users.create(userData);
      console.log("User created successfully:", createdUser);
      return createdUser;
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  }

  // Get current user session
  async getCurrentUser() {
    try {
      const currentUser = await account.get();
      
      // Get OAuth sessions to get profile data
      const sessions = await account.listSessions();
      const oauthSession = sessions.sessions.find(session => 
        session.provider !== 'email' && session.provider.includes('google')
      );

      if (oauthSession) {
        // Get OAuth account
        const accountInfo = await account.getSession(oauthSession.$id);
        console.log("OAuth account info:", accountInfo);
        
        // Merge OAuth data with user data
        return {
          ...currentUser,
          prefs: {
            ...currentUser.prefs,
            avatar: accountInfo.providerAccessToken ? `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${accountInfo.providerAccessToken}` : null
          }
        };
      }

      return currentUser;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  // Sign out
  async signOut() {
    try {
      await account.deleteSession("current");
      return true;
    } catch (error) {
      console.error("Error signing out:", error);
      return false;
    }
  }
}

export const authService = new AuthService();
