import { Link } from "react-router-dom";
import { ExternalLink, MessageSquare, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
}

export function PromotedStory({ story }: PromotedStoryProps) {
  return (
    <div className="bg-card rounded-lg border overflow-hidden mb-6">
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
      
      <div className="p-5">
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
          
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-medium leading-tight">
                  <Link to={`/item/${story.id}`} className="hover:text-hn-orange transition-colors duration-200">
                    {story.title}
                  </Link>
                </h2>
                
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
                  className="inline-block mt-1 text-sm text-muted-foreground hover:text-hn-orange"
                >
                  {story.domain}
                </a>
              )}
            </div>
            
            {story.preview && (
              <p className="text-muted-foreground">{story.preview}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <div>
                <span className="text-foreground">Posted by </span>
                <Link to={`/user/${story.user}`} className="hover:text-hn-orange font-medium">
                  {story.user}
                </Link>
              </div>
              
              <div>{story.time}</div>
              
              <Link to={`/item/${story.id}`} className="hover:text-hn-orange">
                <MessageSquare className="inline h-4 w-4 mr-1" />
                {story.commentsCount} comments
              </Link>
            </div>
            
            {story.tags && story.tags.length > 0 && (
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
            
            <div className="pt-2">
              <Link 
                to={`/item/${story.id}`}
                className="inline-block px-4 py-2 bg-hn-orange text-white rounded-md font-medium hover:bg-hn-orange/90 transition-colors"
              >
                Read Discussion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
