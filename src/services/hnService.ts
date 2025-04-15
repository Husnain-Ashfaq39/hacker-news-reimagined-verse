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

// Add this new function to extract and count tags from stories
export function extractTrendingTags(stories: Story[]): { name: string; count: number }[] {
  // Create a map to count tag occurrences
  const tagCounts = new Map<string, number>();
  
  // Process each story to extract tags
  stories.forEach(story => {
    // Extract tags from the story's tags property if available
    if (story.tags && story.tags.length > 0) {
      story.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 3); // Give higher weight to explicit tags
      });
    }
    
    // Extract potential tags from the title and URL
    const titleWords = story.title.toLowerCase().split(/\W+/).filter(w => w.length > 2);
    const domainWords = story.domain ? story.domain.toLowerCase().split(/\W+/).filter(w => w.length > 2) : [];
    
    // Common tech terms that might be tags - expanded list
    const techTerms = [
      // Programming languages
      'javascript', 'typescript', 'python', 'java', 'kotlin', 'swift', 'c++', 'csharp', 'c#',
      'go', 'golang', 'rust', 'ruby', 'php', 'perl', 'scala', 'haskell', 'erlang', 'elixir',
      'dart', 'lua', 'julia', 'r', 'matlab', 'cobol', 'fortran', 'assembly', 'webassembly',
      'wasm', 'solidity', 'objective-c', 'lisp', 'clojure', 'groovy',
      
      // Frontend
      'react', 'vue', 'angular', 'svelte', 'jquery', 'backbone', 'ember', 'nextjs', 'nuxt',
      'gatsby', 'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap', 'material-ui',
      'chakra-ui', 'storybook', 'figma', 'sketch', 'framer', 'pwa', 'responsive',
      
      // Backend
      'node', 'express', 'django', 'flask', 'fastapi', 'rails', 'spring', 'laravel', 'symfony',
      'nestjs', 'graphql', 'rest', 'api', 'microservices', 'serverless', 'webapp',
      
      // Data & ML
      'ai', 'ml', 'machine learning', 'deep learning', 'neural network', 'tensorflow',
      'pytorch', 'keras', 'hugging face', 'transformers', 'gpt', 'llm', 'nlp', 'computer vision',
      'cv', 'reinforcement learning', 'rl', 'generative ai', 'gan', 'diffusion model',
      'data science', 'big data', 'analytics', 'visualization', 'tableau', 'power bi',
      'data mining', 'etl', 'data engineering', 'data warehouse',
      
      // Cloud & DevOps
      'cloud', 'aws', 'azure', 'gcp', 'google cloud', 'digital ocean', 'heroku', 'netlify',
      'vercel', 'docker', 'kubernetes', 'k8s', 'container', 'devops', 'ci/cd', 'github actions',
      'gitlab', 'jenkins', 'terraform', 'ansible', 'chef', 'puppet', 'monitoring', 'logging',
      'observability', 'prometheus', 'grafana', 'serverless',
      
      // Databases
      'database', 'sql', 'nosql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
      'cassandra', 'dynamodb', 'firebase', 'supabase', 'sqlite', 'oracle', 'mariadb',
      'neo4j', 'graph database', 'time series', 'influxdb',
      
      // Web3 & Crypto
      'blockchain', 'crypto', 'web3', 'bitcoin', 'ethereum', 'nft', 'token', 'defi',
      'decentralized', 'dapp', 'dao', 'smart contract', 'wallet', 'solana', 'cardano',
      
      // Mobile
      'mobile', 'ios', 'android', 'flutter', 'react native', 'pwa', 'swift', 'kotlin',
      'xamarin', 'ionic', 'capacitor', 'cordova', 'native',
      
      // Security
      'security', 'privacy', 'encryption', 'hacking', 'vulnerability', 'authentication',
      'authorization', 'oauth', 'jwt', 'zero trust', 'pentest', 'bug bounty', 'infosec',
      'cyber', 'ransomware',
      
      // OS & Systems
      'linux', 'windows', 'macos', 'unix', 'ubuntu', 'debian', 'fedora', 'centos', 'redhat',
      'embedded', 'raspberry pi', 'arduino', 'iot', 'rtos', 'kernel',
      
      // Gaming
      'game development', 'gamedev', 'unity', 'unreal', 'godot', 'gaming', 'directx', 'opengl',
      'vulkan', 'vr', 'ar', 'xr', 'metaverse', 'oculus', 'quest',
      
      // Business & Industry
      'startup', 'funding', 'venture', 'vc', 'saas', 'software', 'entrepreneur', 'series a',
      'fintech', 'medtech', 'healthtech', 'edtech', 'agritech', 'biotech', 'govtech',
      'legaltech', 'proptech', 'insurtech', 'regtech',
      
      // Open Source
      'open source', 'oss', 'github', 'gitlab', 'contribution', 'community', 'mozilla',
      'apache', 'mit license', 'gpl',
      
      // Hacker News specific
      'showhn', 'askhn', 'tellhn', 'yc', 'ycombinator', 'startup school'
    ];
    
    // Expanded NLP approach
    // 1. Check single word matches
    titleWords.forEach(word => {
      if (techTerms.includes(word)) {
        tagCounts.set(word, (tagCounts.get(word) || 0) + 2);
      }
    });
    
    // 2. Check domain-specific keywords
    domainWords.forEach(word => {
      if (techTerms.includes(word)) {
        tagCounts.set(word, (tagCounts.get(word) || 0) + 1);
      }
    });
    
    // 3. Check for multi-word tech terms
    const titleLower = story.title.toLowerCase();
    techTerms.forEach(term => {
      if (term.includes(' ')) {
        if (titleLower.includes(term)) {
          // Give higher weight to multi-word matches as they're more specific
          tagCounts.set(term, (tagCounts.get(term) || 0) + 4);
        }
      }
    });
    
    // 4. Check for compound words (e.g., "machinelearning" instead of "machine learning")
    techTerms.forEach(term => {
      if (term.includes(' ')) {
        const compoundTerm = term.replace(/\s+/g, '');
        if (titleWords.includes(compoundTerm)) {
          tagCounts.set(term, (tagCounts.get(term) || 0) + 3);
        }
      }
    });
    
    // 5. Detect product-specific references
    if (titleLower.includes('github') || story.domain?.includes('github.com')) {
      tagCounts.set('github', (tagCounts.get('github') || 0) + 2);
    }
    
    if (titleLower.match(/\bgpt-[34]\b/) || titleLower.includes('openai')) {
      tagCounts.set('ai', (tagCounts.get('ai') || 0) + 2);
      tagCounts.set('openai', (tagCounts.get('openai') || 0) + 3);
    }
  });
  
  // Apply some post-processing to improve quality
  
  // 1. Merge similar tags
  const synonyms: {[key: string]: string} = {
    'javascript': 'javascript',
    'js': 'javascript',
    'typescript': 'typescript',
    'ts': 'typescript',
    'react.js': 'react',
    'reactjs': 'react',
    'vue.js': 'vue',
    'vuejs': 'vue',
    'golang': 'go',
    'ai': 'ai',
    'machine learning': 'ml',
    'machine-learning': 'ml',
    'machinelearning': 'ml',
    'deep learning': 'ml',
    'kubernetes': 'k8s',
    'blockchain': 'web3',
    'ethereum': 'web3'
  };
  
  // Create a new map for merged tags
  const mergedTagCounts = new Map<string, number>();
  
  for (const [tag, count] of tagCounts.entries()) {
    const normalizedTag = synonyms[tag] || tag;
    mergedTagCounts.set(normalizedTag, (mergedTagCounts.get(normalizedTag) || 0) + count);
  }
  
  // Convert the map to an array and sort by count (descending)
  return Array.from(mergedTagCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15); // Return the top 15 tags
} 