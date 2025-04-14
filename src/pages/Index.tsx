import { useState, useEffect } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FilterBar } from "@/components/FilterBar";
import { StoryCard } from "@/components/StoryCard";
import { TrendingTags } from "@/components/TrendingTags";
import { PromotedStory } from "@/components/PromotedStory";
import { fetchStoryIds, fetchStories, Story } from "@/services/hnService";

const Index = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("top");
  const [timeRange, setTimeRange] = useState("today");
  const [stories, setStories] = useState<Story[]>([]);
  const [promotedStory, setPromotedStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Determine which story type to fetch based on filter and sort
        let storyType: 'top' | 'new' | 'best' | 'ask' | 'show' | 'job' = 'top';
        
        if (sort === 'top') storyType = 'top';
        else if (sort === 'new') storyType = 'new';
        else if (sort === 'best') storyType = 'best';
        
        // Fetch appropriate story IDs
        let ids: number[] = [];
        
        if (filter === 'ask') {
          ids = await fetchStoryIds('ask');
        } else if (filter === 'show') {
          ids = await fetchStoryIds('show');
        } else if (filter === 'jobs') {
          ids = await fetchStoryIds('job');
        } else {
          ids = await fetchStoryIds(storyType);
        }
        
        // Fetch the full story data for the IDs
        const fetchedStories = await fetchStories(ids, 20);
        
        // Additional filtering if needed
        let filteredStories = fetchedStories;
        
        if (filter === 'articles') {
          filteredStories = fetchedStories.filter(
            story => story.url && 
            !story.title.startsWith('Show HN:') && 
            !story.title.startsWith('Ask HN:')
          );
        } else if (filter === 'discussions') {
          filteredStories = fetchedStories.filter(
            story => !story.url || 
            story.title.startsWith('Ask HN:')
          );
        }
        
        // Set the first story as promoted if available
        if (filteredStories.length > 0) {
          setPromotedStory(filteredStories[0]);
          setStories(filteredStories.slice(1));
        } else {
          setPromotedStory(null);
          setStories([]);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to fetch stories. Please try again later.');
        setStories([]);
        setPromotedStory(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [filter, sort, timeRange]);
  
  return (
    <PageLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <FilterBar 
              onFilterChange={setFilter}
              onSortChange={setSort}
              onTimeChange={setTimeRange}
            />
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent" role="status">
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
                  {stories.map(story => (
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
                  <div className="text-center py-12 text-muted-foreground">
                    No stories found with current filters.
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="space-y-6">
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-3">About Hacker News</h3>
              <p className="text-sm text-muted-foreground">
                Hacker News is a social news website focusing on computer science and entrepreneurship. It is run by Y Combinator, a startup accelerator.
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
            
            <TrendingTags />
            
            <div className="bg-card rounded-lg border p-4">
              <h3 className="font-medium mb-3">Top Contributors</h3>
              <div className="space-y-3">
                {["innovator", "techguru", "startupfounder", "codemaster", "airesearcher"].map((user, index) => (
                  <div key={user} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-hn-orange/10 text-hn-orange rounded-full flex items-center justify-center font-medium">
                        {user.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{user}</div>
                        <div className="text-xs text-muted-foreground">{5000 - index * 632} karma</div>
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
