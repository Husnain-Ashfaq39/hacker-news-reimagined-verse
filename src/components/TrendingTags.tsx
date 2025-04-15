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
      ]);
    }
  }, [stories]);
  
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-hn-orange" />
        <h3 className="font-medium">Trending Topics</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {trendingTags.map(tag => (
          <Link key={tag.name} to={`/tag/${tag.name}`}>
            <Badge 
              variant="secondary" 
              className="bg-secondary/70 hover:bg-secondary cursor-pointer"
            >
              {tag.name} <span className="ml-1 text-muted-foreground">{tag.count}</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}
