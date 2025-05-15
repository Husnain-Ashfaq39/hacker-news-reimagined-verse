import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageLayout } from "@/components/PageLayout";
import { StoryCard } from "@/components/StoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X } from "lucide-react";
import { useStoryIds, useStories } from "@/hooks/useHnQueries";
import { searchStories, highlightMatches } from "@/services/searchService";
import { Story } from "@/services/hnService";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(query);
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "stories" | "users" | "domains">("all");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  
  // Fetch saved stories from localStorage
  useEffect(() => {
    const savedStoriesJson = localStorage.getItem("hn_saved_stories");
    if (savedStoriesJson) {
      try {
        const parsedStories = JSON.parse(savedStoriesJson);
        setSavedStories(parsedStories);
      } catch (err) {
        console.error("Error loading saved stories:", err);
      }
    }
  }, []);
  
  // Check if a story is saved
  const isStorySaved = (storyId: number) => {
    return savedStories.some(story => story.id === storyId);
  };
  
  // Save or unsave a story
  const toggleSaveStory = (story: Story) => {
    if (isStorySaved(story.id)) {
      // Remove story from saved stories
      const newSavedStories = savedStories.filter(s => s.id !== story.id);
      setSavedStories(newSavedStories);
      localStorage.setItem("hn_saved_stories", JSON.stringify(newSavedStories));
    } else {
      // Add story to saved stories
      const newSavedStories = [...savedStories, story];
      setSavedStories(newSavedStories);
      localStorage.setItem("hn_saved_stories", JSON.stringify(newSavedStories));
    }
  };
  
  // Fetch stories for search
  const { data: storyIds = [] } = useStoryIds("top");
  const { data: storiesData = [], isLoading: isStoriesLoading } = useStories(storyIds.slice(0, 100) as number[], 100);
  
  // Perform search when query changes
  useEffect(() => {
    setIsLoading(true);
    
    if (!query.trim() || !storiesData.length) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }
    
    const results = searchStories(storiesData as Story[], query);
    
    // Apply filtering
    let filteredResults = results;
    if (filterType === "stories") {
      filteredResults = results.filter(story => story.url && !story.url.includes("item?id="));
    } else if (filterType === "users") {
      filteredResults = results.filter(story => 
        query.toLowerCase().includes(story.user.toLowerCase()) || 
        story.user.toLowerCase().includes(query.toLowerCase())
      );
    } else if (filterType === "domains") {
      filteredResults = results.filter(story => 
        story.domain && (
          query.toLowerCase().includes(story.domain.toLowerCase()) ||
          story.domain.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
    
    setSearchResults(filteredResults);
    setIsLoading(false);
  }, [query, storiesData, filterType]);
  
  // Handle new search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };
  
  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchParams({});
  };
  
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-card rounded-lg border p-4 mb-6">
            <h1 className="text-2xl font-bold mb-4">Search Results</h1>
            
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories, users, domains..."
                className="pl-10 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={clearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="text-xs"
              >
                All Results
              </Button>
              <Button
                variant={filterType === "stories" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("stories")}
                className="text-xs"
              >
                Stories
              </Button>
              <Button
                variant={filterType === "users" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("users")}
                className="text-xs"
              >
                By User
              </Button>
              <Button
                variant={filterType === "domains" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("domains")}
                className="text-xs"
              >
                By Domain
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            {query ? (
              <p className="text-sm text-muted-foreground">
                Found {searchResults.length} results for "{query}"
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Enter a search term to find stories
              </p>
            )}
          </div>
          
          {isLoading || isStoriesLoading ? (
            <div className="text-center py-12">
              <div
                className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent"
                role="status"
              >
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-4 text-muted-foreground">Searching...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {searchResults.length > 0 ? (
                searchResults.map((story) => (
                  <StoryCard 
                    key={story.id} 
                    story={story} 
                    isSaved={isStorySaved(story.id)}
                    onSaveToggle={() => toggleSaveStory(story)}
                  />
                ))
              ) : query ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground">No results found for "{query}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try different keywords or check your spelling
                  </p>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 