// Hacker News API service
const API_BASE_URL = 'https://hacker-news.firebaseio.com/v0';

export interface HNStory {
  id: number;
  title: string;
  url?: string;
  time: number; // UNIX timestamp
  score: number;
  by: string;
  descendants: number; // number of comments
  kids?: number[]; // comment IDs
  text?: string; // for self-posts
  type: string;
}

export interface HNComment {
  id: number;
  by: string;
  time: number;
  text: string;
  kids?: number[];
  parent: number;
  type: string;
  deleted?: boolean;
  dead?: boolean;
}

export interface HNUser {
  id: string;      // username
  created: number; // UNIX timestamp
  karma: number;
  submitted?: number[]; // IDs of stories/comments submitted
  about?: string;  // user's bio/description
}

export interface Story {
  id: number;
  title: string;
  url: string;
  domain?: string;
  points: number;
  user: string;
  time: string;
  commentsCount: number;
  preview?: string;
  tags?: string[];
}

export interface Comment {
  id: number;
  user: string;
  time: string;
  text: string;
  level: number;
  kids?: Comment[];
  deleted?: boolean;
  dead?: boolean;
}

/**
 * Fetch IDs of stories based on type
 */
export const fetchStoryIds = async (storyType: 'top' | 'new' | 'best' | 'ask' | 'show' | 'job'): Promise<number[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/${storyType}stories.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${storyType} stories`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${storyType} story IDs:`, error);
    return [];
  }
};

/**
 * Fetch a single story by ID
 */
export const fetchItem = async (id: number): Promise<HNStory | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch item ${id}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching item ${id}:`, error);
    return null;
  }
};

/**
 * Fetch a comment by ID
 */
export const fetchComment = async (id: number): Promise<HNComment | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/item/${id}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch comment ${id}`);
    }
    const comment = await response.json();
    
    // Check if it's a valid comment
    if (!comment || comment.type !== 'comment') {
      return null;
    }
    
    return comment;
  } catch (error) {
    console.error(`Error fetching comment ${id}:`, error);
    return null;
  }
};

/**
 * Fetch all comments for a story recursively
 */
export const fetchComments = async (commentIds: number[] = [], level = 0): Promise<Comment[]> => {
  if (!commentIds || commentIds.length === 0) {
    return [];
  }
  
  try {
    const commentPromises = commentIds.map(id => fetchComment(id));
    const comments = await Promise.all(commentPromises);
    
    // Filter out null comments and process the valid ones
    const validComments = comments
      .filter((comment): comment is HNComment => 
        comment !== null && 
        !comment.deleted && 
        !comment.dead
      );
    
    // Process each comment and fetch its children recursively
    const processedComments = await Promise.all(
      validComments.map(async comment => {
        const formattedComment: Comment = {
          id: comment.id,
          user: comment.by,
          time: formatRelativeTime(comment.time),
          text: comment.text || '',
          level: level,
          deleted: comment.deleted,
          dead: comment.dead
        };
        
        // Fetch child comments if any
        if (comment.kids && comment.kids.length > 0) {
          formattedComment.kids = await fetchComments(comment.kids, level + 1);
        }
        
        return formattedComment;
      })
    );
    
    return processedComments;
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

/**
 * Fetch a story with its comments
 */
export const fetchStoryWithComments = async (id: number): Promise<{ story: Story | null; comments: Comment[] }> => {
  try {
    const hnStory = await fetchItem(id);
    
    if (!hnStory) {
      return { story: null, comments: [] };
    }
    
    const story = hnStoryToStory(hnStory);
    const comments = await fetchComments(hnStory.kids || []);
    
    return { story, comments };
  } catch (error) {
    console.error(`Error fetching story with comments for ID ${id}:`, error);
    return { story: null, comments: [] };
  }
};

/**
 * Fetch user data by username
 */
export const fetchUser = async (username: string): Promise<HNUser | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/${username}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch user ${username}`);
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error(`Error fetching user ${username}:`, error);
    return null;
  }
};

/**
 * Fetch multiple stories by their IDs
 */
export const fetchStories = async (ids: number[], limit = 12): Promise<Story[]> => {
  try {
    const storyPromises = ids.slice(0, limit).map(id => fetchItem(id));
    const stories = await Promise.all(storyPromises);
    
    return stories
      .filter((story): story is HNStory => 
        story !== null && 
        story.type === 'story'
      )
      .map(hnStoryToStory);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
};

/**
 * Extract domain from URL
 */
export const extractDomain = (url?: string): string | undefined => {
  if (!url) return undefined;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch (error) {
    return undefined;
  }
};

/**
 * Format timestamp to relative time
 */
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now() / 1000; // current time in seconds
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString();
};

/**
 * Format timestamp to date
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Convert HN API story to our app's story format
 */
export const hnStoryToStory = (hnStory: HNStory): Story => {
  const domain = extractDomain(hnStory.url);
  
  // Generate tags based on title and content
  const tags: string[] = [];
  
  if (hnStory.title.startsWith('Show HN:')) {
    tags.push('showhn');
  } else if (hnStory.title.startsWith('Ask HN:')) {
    tags.push('askhn');
  }
  
  // Add technology tags based on content (simplified version)
  const techKeywords = ['react', 'javascript', 'python', 'ai', 'ml', 'rust', 'golang', 'webdev'];
  techKeywords.forEach(keyword => {
    if (
      hnStory.title.toLowerCase().includes(keyword) || 
      (hnStory.text && hnStory.text.toLowerCase().includes(keyword))
    ) {
      tags.push(keyword);
    }
  });
  
  return {
    id: hnStory.id,
    title: hnStory.title,
    url: hnStory.url || `https://news.ycombinator.com/item?id=${hnStory.id}`,
    domain: domain,
    points: hnStory.score,
    user: hnStory.by,
    time: formatRelativeTime(hnStory.time),
    commentsCount: hnStory.descendants || 0,
    preview: hnStory.text ? hnStory.text.substring(0, 180) + (hnStory.text.length > 180 ? '...' : '') : undefined,
    tags: tags.length > 0 ? tags : undefined
  };
}; 