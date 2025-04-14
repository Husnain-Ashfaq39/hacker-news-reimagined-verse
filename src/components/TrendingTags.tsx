
import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockTags = [
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
];

export function TrendingTags() {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-4 w-4 text-hn-orange" />
        <h3 className="font-medium">Trending Topics</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {mockTags.map(tag => (
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
