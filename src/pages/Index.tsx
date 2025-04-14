
import { useState } from "react";
import { PageLayout } from "@/components/PageLayout";
import { FilterBar } from "@/components/FilterBar";
import { StoryCard } from "@/components/StoryCard";
import { TrendingTags } from "@/components/TrendingTags";
import { PromotedStory } from "@/components/PromotedStory";
import { mockStories, promotedStory } from "@/data/mockData";

const Index = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("top");
  const [timeRange, setTimeRange] = useState("today");
  
  // Filter stories based on the selected filter
  const filterStories = () => {
    if (filter === "all") return mockStories;
    if (filter === "articles") return mockStories.filter(story => story.url && !story.title.startsWith("Show HN") && !story.title.startsWith("Ask HN"));
    if (filter === "discussions") return mockStories.filter(story => !story.url);
    if (filter === "show") return mockStories.filter(story => story.title.startsWith("Show HN"));
    if (filter === "ask") return mockStories.filter(story => story.title.startsWith("Ask HN"));
    return mockStories;
  };
  
  const filteredStories = filterStories();
  
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
            
            <PromotedStory story={promotedStory} />
            
            <div className="space-y-4">
              {filteredStories.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
            
            <div className="flex justify-center mt-8">
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/70 rounded-md text-sm font-medium transition-colors">
                Load More
              </button>
            </div>
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
