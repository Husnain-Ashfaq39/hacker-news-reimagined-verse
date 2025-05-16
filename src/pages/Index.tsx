import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FilterBar } from "@/components/FilterBar";
import { TrendingTags } from "@/components/TrendingTags";
import { Story } from "@/services/hnService";
import { UserTooltip } from "@/components/UserTooltip";
import { Link } from "react-router-dom";
import { useStoryIds, useStories } from "@/hooks/useHnQueries";
import { Database, RefreshCw, WifiOff, LayoutDashboard, X, Bookmark } from "lucide-react";
import { authService } from "@/services/appwrite/auth.service";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
// Import lazy components instead of direct imports
import { 
  StoryCardWithSuspense as StoryCard,
  PromotedStoryWithSuspense as PromotedStory, 
  NewsSummaryWithSuspense as NewsSummary 
} from "@/components/lazyComponents";

// Key for localStorage
const SAVED_STORIES_KEY = "hn_saved_stories";

const Index = () => {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [timeRange, setTimeRange] = useState("today");
  const [cacheSizeKB, setCacheSizeKB] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // Load saved stories from localStorage on component mount
  useEffect(() => {
    try {
      const savedStoriesJson = localStorage.getItem(SAVED_STORIES_KEY);
      if (savedStoriesJson) {
        const parsedStories = JSON.parse(savedStoriesJson);
        setSavedStories(parsedStories);
      }
    } catch (err) {
      console.error("Error loading saved stories from localStorage:", err);
    }
  }, []);

  // Save to localStorage whenever savedStories changes
  useEffect(() => {
    try {
      localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(savedStories));
    } catch (err) {
      console.error("Error saving stories to localStorage:", err);
    }
  }, [savedStories]);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Use React Query hooks for data fetching with caching
  const {
    data: storyIds = [],
    isLoading: isLoadingIds,
    error: storyIdsError,
    isStale: isStoryIdsStale,
    isFetching: isFetchingIds,
    dataUpdatedAt: storyIdsUpdatedAt,
  } = useStoryIds(sort);

  // Type assertion to ensure storyIds is treated as number[]
  const {
    data: storiesData = [],
    isLoading: isLoadingStories,
    error: storiesError,
    isStale: isStoriesStale,
    isFetching: isFetchingStories,
    dataUpdatedAt: storiesUpdatedAt,
    failureCount,
  } = useStories(storyIds as number[], 20);

  // Derived states
  const loading = isLoadingIds || isLoadingStories;
  const error =
    (storyIdsError || storiesError) && isOnline
      ? "Failed to fetch stories. Please try again later."
      : null;
  
  // Type assertion for storiesData to ensure it's treated as Story[]
  const typedStoriesData = storiesData as Story[];
  
  // Filter stories based on selected tags if any
  const filteredStories = selectedTags.length > 0
    ? typedStoriesData.filter(story => {
        // If a story doesn't have tags, check the title for the selected tags
        if (!story.tags || story.tags.length === 0) {
          const titleLower = story.title.toLowerCase();
          return selectedTags.some(tag => titleLower.includes(tag.toLowerCase()));
        }
        // Otherwise check if any selected tag exists in the story's tags
        return selectedTags.some(tag => 
          story.tags?.some(storyTag => storyTag.toLowerCase() === tag.toLowerCase())
        );
      })
    : typedStoriesData;
  
  // Filter to only show saved stories if showSavedOnly is true
  const displayStories = showSavedOnly 
    ? savedStories 
    : filteredStories;
    
  const promotedStory =
    displayStories.length > 0 ? displayStories[0] : null;
  const stories = displayStories.length > 0 ? displayStories.slice(1) : [];

  // Check if data is coming from cache
  const isFromCache =
    !loading &&
    !isFetchingIds &&
    !isFetchingStories &&
    (isStoryIdsStale || isStoriesStale);

  // Get cache info
  useEffect(() => {
    try {
      const cacheData = localStorage.getItem("HN_REACT_QUERY_CACHE");
      if (cacheData) {
        const sizeBytes = new Blob([cacheData]).size;
        setCacheSizeKB(Math.round(sizeBytes / 1024));
      } else {
        setCacheSizeKB(0);
      }
    } catch (err) {
      console.error("Error checking cache size:", err);
      setCacheSizeKB(null);
    }
  }, [storyIdsUpdatedAt, storiesUpdatedAt]);

  // Handler for tag selection
  const handleTagClick = (tag: string) => {
    // If tag is already selected, remove it
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      // Add the tag to selected tags
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Clear all selected tags
  const clearSelectedTags = () => {
    setSelectedTags([]);
  };

  // Toggle to show saved stories only or all stories
  const toggleSavedStories = () => {
    setShowSavedOnly(!showSavedOnly);
  };

  // Check if a story is saved
  const isStorySaved = (storyId: number) => {
    return savedStories.some(story => story.id === storyId);
  };

  // Save or unsave a story
  const toggleSaveStory = (story: Story) => {
    if (isStorySaved(story.id)) {
      // Remove story from saved stories
      setSavedStories(savedStories.filter(s => s.id !== story.id));
    } else {
      // Add story to saved stories
      setSavedStories([...savedStories, story]);
    }
  };

  // Top contributors - in a real app, these would be dynamically fetched
  const topContributors = ["pg", "dang", "tptacek", "patio11", "jacquesm"];

  // Handler for setting sort that adapts to the FilterBar component
  const handleSortChange = (newSort: string) => {
    setSort(newSort as "top" | "new");
  };

  // Format the data updated time
  const formatUpdatedTime = (timestamp: number) => {
    if (!timestamp) return "Never";
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  // Create skelton array for loading state
  const skeletonArray = Array(10).fill(0);

  return (
    <PageLayout>
      <div className="container py-8">
        {/* Mobile view for Generate Summary and Trending Tags */}
        <div className="lg:hidden space-y-4 mb-6">
          {loading && !storiesData.length ? (
            <>
              
              
              {/* Mobile TrendingTags skeleton */}
              <div className="bg-card rounded-lg border p-4 space-y-3">
                <div className="h-6 bg-muted rounded-md w-2/5 animate-pulse"></div>
                <div className="flex flex-wrap gap-2">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <NewsSummary stories={storiesData as Story[]} />
              <TrendingTags 
                stories={typedStoriesData} 
                onTagClick={handleTagClick}
                selectedTags={selectedTags}
              />
            </>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between gap-y-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {showSavedOnly ? 'Saved Stories' : 'All Stories'}
                </h2>
                <Button 
                  variant={showSavedOnly ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs flex items-center gap-1 ml-2 ${showSavedOnly ? 'bg-hn-orange text-white hover:bg-hn-orange-dark' : ''}`}
                  onClick={toggleSavedStories}
                >
                  <Bookmark className="h-3 w-3" />
                  {savedStories.length > 0 && (
                    <span className="ml-1 text-[10px] bg-primary-foreground/20 px-1 rounded-full">
                      {savedStories.length}
                    </span>
                  )}
                  {showSavedOnly ? 'Saved' : 'Show Saved'}
                </Button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <FilterBar
                  onFilterChange={() => {}} // Empty function since we're not using filters anymore
                  onSortChange={handleSortChange}
                  onTimeChange={setTimeRange}
                  showTitle={false}
                />
              </div>
            </div>

            {/* Show active filters if any tags are selected */}
            {selectedTags.length > 0 && !showSavedOnly && (
              <div className="flex flex-wrap items-center gap-2 bg-muted p-2 rounded-md">
                <span className="text-sm font-medium">Filtered by:</span>
                {selectedTags.map(tag => (
                  <div 
                    key={tag} 
                    className="flex items-center gap-1 bg-hn-orange/10 text-hn-orange text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                    <button 
                      onClick={() => handleTagClick(tag)} 
                      className="hover:text-hn-orange-dark"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button 
                  onClick={clearSelectedTags}
                  className="text-xs text-muted-foreground hover:text-hn-orange ml-2"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Show Saved mode indicator */}
            {showSavedOnly && (
              <div className="flex flex-wrap items-center justify-between gap-2 bg-hn-orange/10 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-hn-orange" />
                  <span className="text-sm font-medium text-hn-orange">Showing saved stories ({savedStories.length})</span>
                </div>
                <button 
                  onClick={toggleSavedStories}
                  className="text-xs text-muted-foreground hover:text-hn-orange"
                >
                  Show all stories
                </button>
              </div>
            )}

            {loading && !storiesData.length && !showSavedOnly ? (
              <div className="space-y-6">
                {/* Promoted story skeleton */}
                <div className="bg-card rounded-lg border overflow-hidden">
                  <div className="relative h-48 bg-gradient-to-br from-muted to-muted/50 animate-pulse"></div>
                  <div className="p-5">
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center pr-3 border-r">
                        <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                        <div className="h-4 w-6 mt-1 bg-muted rounded-md animate-pulse"></div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="h-6 bg-muted rounded-md w-4/5 animate-pulse"></div>
                        <div className="h-4 bg-muted rounded-md w-2/4 animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
                          <div className="h-4 bg-muted rounded-md w-11/12 animate-pulse"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="h-4 w-24 bg-muted rounded-full animate-pulse"></div>
                          <div className="h-4 w-16 bg-muted rounded-full animate-pulse"></div>
                          <div className="h-4 w-20 bg-muted rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story cards skeletons */}
                <div className="space-y-4">
                  {skeletonArray.map((_, index) => (
                    <div key={index} className="bg-card rounded-lg border p-4">
                      <div className="flex gap-3">
                        <div className="flex flex-col items-center pr-3 border-r">
                          <div className="h-8 w-8 bg-muted rounded-full animate-pulse"></div>
                          <div className="h-4 w-6 mt-1 bg-muted rounded-md animate-pulse"></div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-5 bg-muted rounded-md w-4/5 animate-pulse"></div>
                          <div className="h-3 bg-muted rounded-md w-1/4 animate-pulse"></div>
                          <div className="space-y-1">
                            <div className="h-3 bg-muted rounded-md w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-muted rounded-md w-1/2 animate-pulse"></div>
                          </div>
                          <div className="flex gap-2">
                            <div className="h-3 w-16 bg-muted rounded-full animate-pulse"></div>
                            <div className="h-3 w-16 bg-muted rounded-full animate-pulse"></div>
                            <div className="h-3 w-16 bg-muted rounded-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error && !showSavedOnly ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {promotedStory && <PromotedStory 
                  story={promotedStory} 
                  isSaved={isStorySaved(promotedStory.id)}
                  onSaveToggle={() => toggleSaveStory(promotedStory)}
                />}

                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryCard 
                      key={story.id} 
                      story={story} 
                      isSaved={isStorySaved(story.id)}
                      onSaveToggle={() => toggleSaveStory(story)}
                    />
                  ))}
                </div>

                {stories.length > 0 && !showSavedOnly && (
                  <div className="flex justify-center mt-8">
                    <button className="px-4 py-2 bg-hn-orange text-white hover:bg-hn-orange/90 rounded-md text-sm font-medium transition-colors flex items-center gap-2">
                      Load More
                      {(isFetchingIds || isFetchingStories) && (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      )}
                    </button>
                  </div>
                )}

                {stories.length === 0 && !loading && (
                  <>
                    {!isOnline && cacheSizeKB === 0 && !showSavedOnly ? (
                      <div className="text-center py-12 bg-amber-50 text-amber-700 p-4 rounded-lg">
                        <WifiOff className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">You're offline</h3>
                        <p>
                          No cached data is available. Connect to the internet
                          to load stories.
                        </p>
                      </div>
                    ) : showSavedOnly ? (
                      <div className="text-center py-12 text-muted-foreground">
                        You haven't saved any stories yet. 
                        <p className="mt-2 text-sm">
                          Click the bookmark icon on stories you want to read later.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        {selectedTags.length > 0 
                          ? "No stories found matching the selected topics. Try removing some filters."
                          : "No stories found with current filters."}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="hidden lg:block space-y-6">
            {loading && !storiesData.length ? (
              <>
                {/* NewsSummary skeleton */}
                <div className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-md w-full animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse"></div>
                  <div className="h-4 bg-muted rounded-md w-4/5 animate-pulse"></div>
                  <div className="flex justify-end">
                    <div className="h-8 w-24 bg-muted rounded-md animate-pulse"></div>
                  </div>
                </div>
                
                {/* TrendingTags skeleton */}
                <div className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-2/5 animate-pulse"></div>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="h-6 w-16 bg-muted rounded-full animate-pulse"></div>
                    ))}
                  </div>
                </div>
                
                {/* Top Contributors skeleton */}
                <div className="bg-card rounded-lg border p-4 space-y-3">
                  <div className="h-6 bg-muted rounded-md w-2/5 animate-pulse"></div>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
                        <div className="space-y-1">
                          <div className="h-4 w-20 bg-muted rounded-md animate-pulse"></div>
                          <div className="h-3 w-24 bg-muted rounded-md animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-4 w-6 bg-muted rounded-full animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <NewsSummary stories={storiesData as Story[]} />
                
                <TrendingTags 
                  stories={typedStoriesData} 
                  onTagClick={handleTagClick}
                  selectedTags={selectedTags}
                />

                <div className="bg-card rounded-lg border p-4">
                  <h3 className="font-medium mb-3">Top Contributors</h3>
                  <div className="space-y-3">
                    {topContributors.map((user, index) => (
                      <div key={user} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-hn-orange/10 text-hn-orange rounded-full flex items-center justify-center font-medium">
                            {user.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <UserTooltip username={user}>
                              <Link
                                to={`/user/${user}`}
                                className="font-medium text-sm hover:text-hn-orange"
                              >
                                {user}
                              </Link>
                            </UserTooltip>
                            <div className="text-xs text-muted-foreground">
                              {/* Karma will be loaded in the tooltip */}
                              Top contributor
                            </div>
                          </div>
                        </div>
                        <div className="text-xs bg-muted px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
