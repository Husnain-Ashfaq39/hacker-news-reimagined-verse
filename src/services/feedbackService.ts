import { ID } from "appwrite";
import db from "./appwrite/dbServices";
import { authService } from "./appwrite/auth.service";
import { Query } from "@/appwrite/config";

class FeedbackService {
  async submitFeedback(feedbackText: string, rating: number) {
    try {
      // Get current user
      const user = await authService.getCurrentUser();
      
      // Create feedback payload
      const feedbackData = {
        text: feedbackText,
        rating: rating,
        user_id: user?.$id || "anonymous",
        user_name: user?.name || "Anonymous User",
        user_email: user?.email || "",
        created_at: new Date().toISOString(),
      };
      
      // Store feedback in database
      const result = await db.Feedback.create(feedbackData);
      return result;
    } catch (error) {
      console.error("Error submitting feedback:", error);
      throw error;
    }
  }
  
  async getFeedbackForUser(userId: string) {
    try {
      const feedback = await db.Feedback.list([
        Query.equal("user_id", userId)
      ]);
      return feedback.documents;
    } catch (error) {
      console.error("Error getting user feedback:", error);
      return [];
    }
  }
}

export const feedbackService = new FeedbackService(); 