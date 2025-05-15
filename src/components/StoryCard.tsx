import { Link } from "react-router-dom";
import { ExternalLink, MessageSquare, ArrowUp, Clock, User, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserTooltip } from "@/components/UserTooltip";
import { useState, useEffect } from "react";

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
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export function StoryCard({ 
  story, 
  variant = "default", 
  isSaved = false,
  onSaveToggle
}: StoryCardProps) {
  const isCompact = variant === "compact";
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSavedOverlay, setShowSavedOverlay] = useState(false);
  
  // Handle save animation
  const handleSave = () => {
    if (!onSaveToggle) return;
    
    // Only animate when saving (not when unsaving)
    if (!isSaved) {
      setIsAnimating(true);
      setShowSavedOverlay(true);
      
      // Hide the overlay after animation
      setTimeout(() => {
        setShowSavedOverlay(false);
      }, 1500);
    }
    
    onSaveToggle();
  };
  
  // Reset animation state when finished
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  
  return (
    <div className={cn(
      "story-card group relative bg-card rounded-lg border p-4 transition-all duration-200 hover:shadow-md overflow-hidden",
      isCompact ? "p-3" : ""
    )}>
      {/* Save animation overlay */}
      {showSavedOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-hn-orange/5 backdrop-blur-sm z-10 animate-fadeIn">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <Bookmark className="h-12 w-12 text-hn-orange fill-current animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">Saved</span>
              </div>
            </div>
            <div className="mt-2 text-sm text-hn-orange font-medium">Story saved for later</div>
          </div>
        </div>
      )}
      
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
        
        <div className="flex-1 space-y-2 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className={cn(
                "font-medium leading-tight break-words line-clamp-2",
                isCompact ? "text-base" : "text-lg"
              )}>
                <Link to={`/item/${story.id}`} className="hover:text-hn-orange transition-colors duration-200">
                  {story.title}
                </Link>
              </h3>
              
              <div className="flex items-center gap-1">
                {onSaveToggle && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8 text-muted-foreground hover:text-hn-orange hover:bg-hn-orange/10",
                      isAnimating && "animate-saveButtonPulse",
                      isSaved && "text-hn-orange"
                    )}
                    onClick={handleSave}
                    aria-label={isSaved ? "Remove from saved" : "Save for later"}
                    title={isSaved ? "Remove from saved" : "Save for later"}
                  >
                    <Bookmark className={cn(
                      "h-4 w-4 transition-all", 
                      isAnimating && "scale-125",
                      isSaved && "fill-current"
                    )} />
                    
                    {/* Particle effect */}
                    {isAnimating && (
                      <div className="absolute -inset-1 overflow-hidden">
                        <div className="particle-1"></div>
                        <div className="particle-2"></div>
                        <div className="particle-3"></div>
                        <div className="particle-4"></div>
                        <div className="particle-5"></div>
                        <div className="particle-6"></div>
                      </div>
                    )}
                  </Button>
                )}
                
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
            </div>
            
            {story.domain && (
              <a 
                href={`/from/${encodeURIComponent(story.domain)}`}
                className="inline-block mt-1 text-xs text-muted-foreground hover:text-hn-orange truncate max-w-full"
              >
                {story.domain}
              </a>
            )}
          </div>
          
          {story.preview && (
            <div className="story-preview text-sm text-muted-foreground">
              <p className="line-clamp-2 break-words">{story.preview}</p>
            </div>
          )}
          
          <div className={cn(
            "flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground",
            isCompact ? "mt-1" : "mt-2"
          )}>
            <div className="flex items-center gap-1 min-w-0">
              <User className="h-3.5 w-3.5 shrink-0" />
              <UserTooltip username={story.user}>
                <Link to={`/user/${story.user}`} className="hover:text-hn-orange truncate">
                  {story.user}
                </Link>
              </UserTooltip>
            </div>
            
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="h-3.5 w-3.5" />
              <span>{story.time}</span>
            </div>
            
            <Link 
              to={`/item/${story.id}`} 
              className="flex items-center gap-1 hover:text-hn-orange shrink-0"
              aria-label={`View ${story.commentsCount} comments`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>{story.commentsCount} <span className="hidden xs:inline">comments</span></span>
            </Link>
          </div>
          
          {story.tags && story.tags.length > 0 && !isCompact && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {story.tags.slice(0, 3).map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs bg-secondary/70 hover:bg-secondary truncate max-w-[120px]"
                >
                  {tag}
                </Badge>
              ))}
              {story.tags.length > 3 && 
                <Badge variant="outline" className="text-xs">
                  +{story.tags.length - 3}
                </Badge>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
