import { Link } from "react-router-dom";
import { ExternalLink, MessageSquare, ArrowUp, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserTooltip } from "@/components/UserTooltip";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface PromotedStoryProps {
  story: {
    id: number;
    title: string;
    url: string;
    domain?: string;
    points: number;
    user: string;
    time: string;
    commentsCount: number;
    preview?: string;
    image?: string;
    tags?: string[];
  };
  isSaved?: boolean;
  onSaveToggle?: () => void;
}

export function PromotedStory({ story, isSaved = false, onSaveToggle }: PromotedStoryProps) {
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
    <div className="bg-card rounded-lg border overflow-hidden mb-6 relative">
      {/* Save animation overlay */}
      {showSavedOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-hn-orange/5 backdrop-blur-sm z-10 animate-fadeIn">
          <div className="flex flex-col items-center justify-center">
            <div className="relative">
              <Bookmark className="h-16 w-16 text-hn-orange fill-current animate-pulse" />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">Saved</span>
              </div>
            </div>
            <div className="mt-3 text-base text-hn-orange font-medium">Story saved for later</div>
          </div>
        </div>
      )}
      
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-hn-orange/20 to-hn-orange/5">
        {story.image ? (
          <img 
            src={story.image} 
            alt={story.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="text-8xl font-bold">HN</div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
      </div>
      
      <div className="p-5 sm:p-5 p-4">
        <div className="flex gap-3">
          <div className="flex flex-col items-center pr-3 border-r">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-muted-foreground hover:text-hn-orange hover:bg-hn-orange/10"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
            <span className="text-sm font-medium mt-1">{story.points}</span>
          </div>
          
          <div className="flex-1 space-y-3 min-w-0">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-medium leading-tight break-words line-clamp-3">
                  <Link to={`/item/${story.id}`} className="hover:text-hn-orange transition-colors duration-200">
                    {story.title}
                  </Link>
                </h2>
                
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
                  className="inline-block mt-1 text-sm text-muted-foreground hover:text-hn-orange truncate max-w-full"
                >
                  {story.domain}
                </a>
              )}
            </div>
            
            {story.preview && (
              <p className="text-muted-foreground line-clamp-2 break-words">{story.preview}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-muted-foreground">
              <div className="min-w-0">
                <span className="text-foreground">Posted by </span>
                <UserTooltip username={story.user} position="top">
                  <Link to={`/user/${story.user}`} className="hover:text-hn-orange font-medium truncate inline-block align-bottom max-w-[120px] xs:max-w-none">
                    {story.user}
                  </Link>
                </UserTooltip>
              </div>
              
              <div className="shrink-0">{story.time}</div>
              
              <Link 
                to={`/item/${story.id}`} 
                className="hover:text-hn-orange flex items-center shrink-0"
                aria-label={`View ${story.commentsCount} comments`}
              >
                <MessageSquare className="inline h-4 w-4 mr-1" />
                {story.commentsCount} <span className="hidden xs:inline">comments</span>
              </Link>
            </div>
            
            {story.tags && story.tags.length > 0 && (
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
            
            <div className="pt-2 flex items-center gap-3">
              <Link 
                to={`/item/${story.id}`}
                className="inline-block px-4 py-2 bg-hn-orange text-white rounded-md font-medium hover:bg-hn-orange/90 transition-colors"
              >
                Read Discussion
              </Link>
              
              {isSaved && (
                <div className="text-xs text-hn-orange flex items-center gap-1">
                  <Bookmark className="h-3 w-3 fill-current" />
                  <span>Saved for later</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
