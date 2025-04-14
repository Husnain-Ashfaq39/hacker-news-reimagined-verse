import { Link } from "react-router-dom";
import { ExternalLink, MessageSquare, ArrowUp, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserTooltip } from "@/components/UserTooltip";

interface StoryCardProps {
  story: {
    id: number;
    title: string;
    url: string;
    domain?: string;
    points: number;
    user: string;
    time: string;
    commentsCount: number;
    tags?: string[];
    preview?: string;
  };
  variant?: "default" | "compact";
}

export function StoryCard({ story, variant = "default" }: StoryCardProps) {
  const isCompact = variant === "compact";
  
  return (
    <div className={cn(
      "story-card group relative bg-card rounded-lg border p-4 transition-all duration-200 hover:shadow-md",
      isCompact ? "p-3" : ""
    )}>
      <div className="flex gap-3">
        <div className={cn(
          "flex flex-col items-center",
          isCompact ? "pr-2" : "pr-3 border-r"
        )}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-hn-orange hover:bg-hn-orange/10"
          >
            <ArrowUp className="h-5 w-5" />
          </Button>
          <span className={cn(
            "text-sm font-medium", 
            isCompact ? "" : "mt-1"
          )}>
            {story.points}
          </span>
        </div>
        
        <div className="flex-1 space-y-2">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium leading-tight",
                isCompact ? "text-base" : "text-lg"
              )}>
                <Link to={`/item/${story.id}`} className="hover:text-hn-orange transition-colors duration-200">
                  {story.title}
                </Link>
              </h3>
              
              {story.url && (
                <a 
                  href={story.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Open external link"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            
            {story.domain && (
              <a 
                href={`/from/${encodeURIComponent(story.domain)}`}
                className="inline-block mt-1 text-xs text-muted-foreground hover:text-hn-orange"
              >
                {story.domain}
              </a>
            )}
          </div>
          
          {story.preview && (
            <div className="story-preview text-sm text-muted-foreground">
              <p>{story.preview}</p>
            </div>
          )}
          
          <div className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
            isCompact ? "mt-1" : "mt-2"
          )}>
            <div className="flex items-center gap-1">
              <User className="h-3.5 w-3.5" />
              <UserTooltip username={story.user}>
                <Link to={`/user/${story.user}`} className="hover:text-hn-orange">
                  {story.user}
                </Link>
              </UserTooltip>
            </div>
            
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{story.time}</span>
            </div>
            
            <Link to={`/item/${story.id}`} className="flex items-center gap-1 hover:text-hn-orange">
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{story.commentsCount} comments</span>
            </Link>
          </div>
          
          {story.tags && story.tags.length > 0 && !isCompact && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {story.tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs bg-secondary/70 hover:bg-secondary"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
