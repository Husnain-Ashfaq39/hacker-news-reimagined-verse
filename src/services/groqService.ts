import { Story } from '@/services/hnService';
import db from '@/services/appwrite/dbServices';
import { ID, Query } from 'appwrite';

interface SummaryResponse {
  summary: string;
  status: 'success' | 'error';
  message?: string;
  $id?: string; // Appwrite document ID for sharing
}

// Define the summary data structure
interface SummaryData {
  $id?: string; // Appwrite's document ID
  summary: string;
  timestamp: number; // Unix timestamp in seconds (not milliseconds)
  storyCount: number;
  userId?: string; // Optional: to associate summaries with users if needed
}

export class GroqService {
  private static API_URL = import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  private static API_KEY = import.meta.env.VITE_GROQ_API_KEY;
  private static MODEL = import.meta.env.VITE_GROQ_MODEL || 'llama3-70b-8192';

  /**
   * Generates a unique ID for summary sharing
   * @returns A unique string ID
   */
  private static generateSummaryId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
  }

  /**
   * Generates a summary of multiple news stories using the Groq API
   * @param stories - Array of news stories to summarize
   * @returns A promise that resolves to the summary response
   */
  public static async generateNewsSummary(stories: Story[]): Promise<SummaryResponse> {
    try {
      if (!this.API_KEY) {
        throw new Error('Groq API key is not configured');
      }

      // Extract relevant information from stories
      const storyTexts = stories.map(story => {
        return `Title: ${story.title}
URL: ${story.url || 'No URL'}
By: ${story.user}
Score: ${story.points}
Domain: ${story.domain || 'Unknown'}
`;
      }).join('\n\n');

      // Prepare the prompt for summarization
      const prompt = `
You are an expert news analyst. Summarize the following Hacker News stories into a concise overview of the current tech landscape. 
Focus on identifying key trends, noteworthy developments, and connections between different news items.
Organize the summary with clear sections and proper formatting.

Here are the stories to summarize:

${storyTexts}

Please provide ONLY:
1. A section titled "Overall Summary:" with a concise overview (1-2 paragraphs)
2. A section titled "Key Trends:" with 3-5 numbered key trends (each 1-2 sentences)
3. A section titled "Most Significant Developments:" with 2-4 numbered key developments (each 1-2 sentences)
4. A section titled "Connections and Patterns:" (optional if relevant connections exist)

Important formatting guidance:
- DO NOT include any introduction paragraph or "Here is the summary:" text
- Start directly with the "Overall Summary:" section
- DO NOT use asterisks or other markdown symbols
- Use clean numbered lists (1., 2., etc.) 
- Use clear section titles followed by a colon
- Add proper spacing between paragraphs and sections
- Keep the overall summary concise and focused
`;

      // Make API request to Groq
      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: [
            { role: 'system', content: 'You are a helpful assistant that summarizes news stories concisely and accurately.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const summary = data.choices[0].message.content;

      try {
        // Save the summary directly to Appwrite database
        const summaryData = {
          summary,
          timestamp: Math.floor(Date.now() / 1000), // Convert to seconds from milliseconds
          storyCount: stories.length,
          // You can add userId here if the user is authenticated
        };
        
        // Log the data we're about to send
        console.log('Creating summary with data:', {
          ...summaryData,
          timestampType: typeof summaryData.timestamp,
        });
        
        const id = ID.unique();
        const createdSummary = await db.Summaries.create(summaryData, id);
        console.log('Created summary with result:', createdSummary);
        
        // Return the summary with the Appwrite document ID
        return {
          summary,
          status: 'success',
          $id: createdSummary.$id
        };
      } catch (dbError) {
        console.error('Failed to store summary in database:', dbError);
        // Return the summary anyway even if database storage failed
        return {
          summary,
          status: 'success',
          $id: this.generateSummaryId() // Fallback to generating an ID if database storage failed
        };
      }
    } catch (error) {
      console.error('Error generating news summary:', error);
      return {
        summary: '',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Retrieve a previously generated summary by ID
   * @param id - The summary ID
   * @returns A promise that resolves to the summary data if found, or null if not found
   */
  public static async getSummaryById(id: string): Promise<SummaryData | null> {
    try {
      console.log(`Retrieving summary with ID: ${id} from Appwrite database`);
      
      const summary = await db.Summaries.get(id);
      console.log('Retrieved summary from database:', summary);
      
      if (summary) {
        // Return the summary with properly mapped fields
        return {
          $id: summary.$id,
          summary: summary.summary,
          timestamp: summary.timestamp,
          storyCount: summary.storyCount,
          userId: summary.userId
        };
      }
      
      console.error(`Summary with ID ${id} not found in database`);
      return null;
    } catch (err) {
      console.error('Failed to retrieve summary from database:', err);
      return null;
    }
  }
  
  /**
   * List summaries with optional filtering
   * @param userId Optional user ID to filter summaries by
   * @param limit Maximum number of summaries to return
   * @returns Array of summary data
   */
  public static async listSummaries(userId?: string, limit = 10): Promise<SummaryData[]> {
    try {
      const queries = [];
      
      if (userId) {
        queries.push(Query.equal('userId', userId));
      }
      
      queries.push(Query.orderDesc('timestamp'));
      queries.push(Query.limit(limit));
      
      const summaries = await db.Summaries.list(queries);
      return summaries.documents;
    } catch (error) {
      console.error('Error listing summaries:', error);
      return [];
    }
  }

  /**
   * Delete a summary by ID
   * @param id The summary ID to delete
   * @returns Success status
   */
  public static async deleteSummary(id: string): Promise<boolean> {
    try {
      await db.Summaries.delete(id);
      return true;
    } catch (error) {
      console.error(`Error deleting summary with ID ${id}:`, error);
      return false;
    }
  }
} 