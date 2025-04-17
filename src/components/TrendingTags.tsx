import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { extractTrendingTags } from "@/services/hnService";
import { Story } from "@/services/hnService";
import { useState, useEffect } from "react";

interface TrendingTagsProps {
  stories?: Story[];
}

export function TrendingTags({ stories = [] }: TrendingTagsProps) {
  const [trendingTags, setTrendingTags] = useState<{ name: string; count: number }[]>([]);
  const [visibleTagCount, setVisibleTagCount] = useState(12);
  const [showMore, setShowMore] = useState(false);
  
  useEffect(() => {
    if (stories.length > 0) {
      // Extract trending tags from the provided stories
      const tags = extractTrendingTags(stories);
      setTrendingTags(tags);
    } else {
      // Fallback to some default tags if no stories are provided
      setTrendingTags([
        { name: "javascript", count: 26 },
        { name: "ai", count: 42 },
        { name: "webdev", count: 18 },
        { name: "programming", count: 31 },
        { name: "startup", count: 16 },
        { name: "react", count: 24 },
        { name: "python", count: 29 },
        { name: "machinelearning", count: 34 },
        { name: "typescript", count: 21 },
        { name: "rust", count: 15 },
        { name: "cloud", count: 14 },
        { name: "kubernetes", count: 19 },
        { name: "aws", count: 22 },
        { name: "devops", count: 17 },
        { name: "security", count: 13 },
        { name: "database", count: 20 },
        { name: "mobile", count: 12 },
        { name: "web3", count: 11 },
        { name: "frontend", count: 18 },
        { name: "backend", count: 16 },
        // Add crypto tags
        { name: "crypto", count: 31 },
        { name: "bitcoin", count: 28 },
        { name: "ethereum", count: 24 },
        { name: "defi", count: 17 },
        { name: "nft", count: 14 },
        // Add stock/finance tags
        { name: "stocks", count: 29 },
        { name: "investing", count: 23 },
        { name: "finance", count: 25 },
        { name: "wallstreetbets", count: 13 },
        { name: "fintech", count: 18 }
      ]);
    }
  }, [stories]);
  
  const toggleShowMore = () => {
    if (showMore) {
      setVisibleTagCount(12);
    } else {
      setVisibleTagCount(trendingTags.length);
    }
    setShowMore(!showMore);
  };
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-hn-orange" />
          <h3 className="font-medium">Trending Topics</h3>
        </div>
        {trendingTags.length > 12 && (
          <button 
            onClick={toggleShowMore}
            className="text-xs text-muted-foreground hover:text-hn-orange"
          >
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {trendingTags.slice(0, visibleTagCount).map(tag => (
          <Link key={tag.name} to={`/tag/${tag.name}`}>
            <Badge 
              variant="secondary" 
              className="bg-secondary/70 hover:bg-secondary cursor-pointer text-xs transition-colors"
            >
              {tag.name} <span className="ml-1 text-muted-foreground">{tag.count}</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
