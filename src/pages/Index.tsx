import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FilterBar } from "@/components/FilterBar";
import { StoryCard } from "@/components/StoryCard";
import { TrendingTags } from "@/components/TrendingTags";
import { PromotedStory } from "@/components/PromotedStory";
import { Story } from "@/services/hnService";
import { UserTooltip } from "@/components/UserTooltip";
import { Link } from "react-router-dom";
import { useStoryIds, useStories } from "@/hooks/useHnQueries";
import { Database, RefreshCw, WifiOff } from "lucide-react";
import { authService } from "@/services/appwrite/auth.service";

const Index = () => {
  const [sort, setSort] = useState<"top" | "new">("top");
  const [timeRange, setTimeRange] = useState("today");
  const [cacheSizeKB, setCacheSizeKB] = useState<number | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

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
  const promotedStory =
    typedStoriesData.length > 0 ? typedStoriesData[0] : null;
  const stories = typedStoriesData.length > 0 ? typedStoriesData.slice(1) : [];

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

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <FilterBar
                onFilterChange={() => {}} // Empty function since we're not using filters anymore
                onSortChange={handleSortChange}
                onTimeChange={setTimeRange}
              />
              {!isOnline && (
                <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline Mode
                </div>
              )}
              {isFromCache && (
                <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                  <Database className="h-3 w-3 mr-1" />
                  Cached data {cacheSizeKB !== null && `(${cacheSizeKB} KB)`}
                  <span className="ml-1 text-gray-500 text-[10px]">
                    Last updated:{" "}
                    {formatUpdatedTime(
                      Math.max(storyIdsUpdatedAt || 0, storiesUpdatedAt || 0)
                    )}
                  </span>
                </div>
              )}
              {(isFetchingIds || isFetchingStories) && (
                <div className="flex items-center text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing data...
                </div>
              )}
            </div>

            {loading && !storiesData.length ? (
              <div className="text-center py-12">
                <div
                  className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent"
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-4 text-muted-foreground">Loading stories...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                {error}
              </div>
            ) : (
              <>
                {promotedStory && <PromotedStory story={promotedStory} />}

                <div className="space-y-4">
                  {stories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>

                {stories.length > 0 && (
                  <div className="flex justify-center mt-8">
                    <button className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-md text-sm font-medium transition-colors">
                      Load More
                    </button>
                  </div>
                )}

                {stories.length === 0 && !loading && (
                  <>
                    {!isOnline && cacheSizeKB === 0 ? (
                      <div className="text-center py-12 bg-amber-50 text-amber-700 p-4 rounded-lg">
                        <WifiOff className="h-8 w-8 mx-auto mb-2" />
                        <h3 className="font-medium mb-1">You're offline</h3>
                        <p>
                          No cached data is available. Connect to the internet
                          to load stories.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No stories found with current filters.
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-3">About Hacker News</h3>
              <p className="text-sm text-muted-foreground">
                Hacker News is a social news website focusing on computer
                science and entrepreneurship. It is run by Y Combinator, a
                startup accelerator.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center text-sm">
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-semibold">42K+</div>
                  <div className="text-xs text-muted-foreground">Stories</div>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <div className="font-semibold">125K+</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
              </div>
            </div>

            <TrendingTags stories={stories} />

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
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Index;
