import { Story } from '@/services/hnService';

// Function to search stories based on a query string
export const searchStories = (stories: Story[], query: string): Story[] => {
  if (!query.trim()) return stories;
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  
  return stories.filter(story => {
    // Check if any search term is in the title
    const titleMatches = searchTerms.some(term => 
      story.title.toLowerCase().includes(term)
    );
    
    // Check if any search term is in the URL's domain
    const domainMatches = story.domain && searchTerms.some(term => 
      story.domain!.toLowerCase().includes(term)
    );
    
    // Check if any search term is in the user's name
    const userMatches = searchTerms.some(term => 
      story.user.toLowerCase().includes(term)
    );
    
    // Check if any search term is in the story tags
    const tagMatches = story.tags && searchTerms.some(term => 
      story.tags!.some(tag => tag.toLowerCase().includes(term))
    );
    
    // Check if any search term is in the preview text
    const previewMatches = story.preview && searchTerms.some(term => 
      story.preview!.toLowerCase().includes(term)
    );
    
    return titleMatches || domainMatches || userMatches || tagMatches || previewMatches;
  });
};

// Function to highlight matching terms in text
export const highlightMatches = (text: string, query: string): string => {
  if (!query.trim()) return text;
  
  const searchTerms = query.toLowerCase().trim().split(/\s+/);
  let highlightedText = text;
  
  searchTerms.forEach(term => {
    // Create a regex that's case insensitive
    const regex = new RegExp(`(${term})`, 'gi');
    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
  });
  
  return highlightedText;
}; 