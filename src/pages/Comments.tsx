import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, MessageSquare, ArrowUp, User, Clock, Filter } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentItem } from "@/components/CommentItem";
import { UserTooltip } from "@/components/UserTooltip";
import { fetchStoryWithComments, Comment, Story } from "@/services/hnService";

export default function Comments() {
  const { id } = useParams<{ id: string }>();
  const storyId = parseInt(id || "0", 10);
  
  const [story, setStory] = useState<Story | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest">("default");
  
  useEffect(() => {
    const fetchData = async () => {
      if (!storyId) {
        setError("Invalid story ID");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchStoryWithComments(storyId);
        setStory(data.story);
        setComments(data.comments);
      } catch (err) {
        console.error("Error fetching story and comments:", err);
        setError("Failed to load story and comments");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [storyId]);
  
  // Sort comments based on the selected sorting option
  const sortedComments = () => {
    if (sortBy === "newest") {
      return [...comments].sort((a, b) => {
        const aTime = new Date(a.time).getTime();
        const bTime = new Date(b.time).getTime();
        return bTime - aTime;
      });
    } else if (sortBy === "oldest") {
      return [...comments].sort((a, b) => {
        const aTime = new Date(a.time).getTime();
        const bTime = new Date(b.time).getTime();
        return aTime - bTime;
      });
    }
    return comments; // Default order (as returned by the API)
  };
  
  if (loading) {
    return (
      <PageLayout>
        <div className="container max-w-5xl py-8">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-muted-foreground">Loading story and comments...</p>
          </div>
        </div>
      </PageLayout>
    );
  }
  
  if (error || !story) {
    return (
      <PageLayout>
        <div className="container max-w-5xl py-8">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-hn-orange mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>
          
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error || "Story not found"}
          </div>
        </div>
      </PageLayout>
    );
  }
  
  return (
    <PageLayout>
      <div className="container max-w-5xl py-8">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-hn-orange mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
        
        {/* Story card with improved styling */}
        <div className="bg-card rounded-lg border overflow-hidden mb-8">
          <div className="p-5 md:p-6">
            <div className="flex gap-4">
              <div className="hidden sm:flex flex-col items-center pr-4 border-r">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-muted-foreground hover:text-hn-orange hover:bg-hn-orange/10"
                >
                  <ArrowUp className="h-5 w-5" />
                </Button>
                <span className="text-sm font-medium mt-1">{story.points}</span>
              </div>
              
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-xl sm:text-2xl font-medium leading-tight">
                      {story.title}
                    </h1>
                    
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
                  <div className="text-muted-foreground border-l-4 border-muted pl-3 py-2 bg-muted/30 rounded-r-md">
                    {story.preview}
                  </div>
                )}
                
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <div className="sm:hidden flex items-center gap-2 bg-muted/50 px-2 py-1 rounded-md">
                    <ArrowUp className="h-3.5 w-3.5 text-hn-orange" />
                    <span className="font-medium">{story.points}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <UserTooltip username={story.user} position="top">
                      <Link to={`/user/${story.user}`} className="hover:text-hn-orange font-medium">
                        {story.user}
                      </Link>
                    </UserTooltip>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{story.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{story.commentsCount} comments</span>
                  </div>
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
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments header with sorting options */}
        <div className="comments-header flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Comments ({comments.length})</h2>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm flex gap-3">
              <button 
                onClick={() => setSortBy("default")} 
                className={`${sortBy === "default" ? "text-hn-orange font-medium" : "text-muted-foreground"} hover:text-hn-orange`}
              >
                Default
              </button>
              <button 
                onClick={() => setSortBy("newest")} 
                className={`${sortBy === "newest" ? "text-hn-orange font-medium" : "text-muted-foreground"} hover:text-hn-orange`}
              >
                Newest
              </button>
              <button 
                onClick={() => setSortBy("oldest")} 
                className={`${sortBy === "oldest" ? "text-hn-orange font-medium" : "text-muted-foreground"} hover:text-hn-orange`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>
        
        {/* Comments section */}
        <div className="comments-section bg-card rounded-lg border p-4 md:p-6">
          {comments.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <MessageSquare className="h-10 w-10 mx-auto mb-4 opacity-30" />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-0">
              {sortedComments().map(comment => (
                <CommentItem key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
} 