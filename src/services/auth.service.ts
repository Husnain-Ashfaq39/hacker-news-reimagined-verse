import { account, ID } from "@/appwrite/config";

class AuthService {
  // Google OAuth sign-in/sign-up
  async signInWithGoogle() {
    try {
      // Get the current URL for the redirect
      const currentUrl = window.location.href;

      // Create OAuth session with Google
      const promise = account.createOAuth2Session(
        "google",
        currentUrl, // Success URL (same page)
        currentUrl // Failure URL (same page)
      );

      return promise;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  }

  // Get current user session
  async getCurrentUser() {
    try {
      const currentUser = await account.get();
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
