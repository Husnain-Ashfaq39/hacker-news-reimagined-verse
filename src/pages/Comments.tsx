import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  ArrowUp,
  User,
  Clock,
  Filter,
  Database,
  WifiOff,
} from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CommentItemWithSuspense as CommentItem } from "@/components/lazyComponents";
import { UserTooltip } from "@/components/UserTooltip";
import { Comment, Story } from "@/services/hnService";
import { useStoryWithComments } from "@/hooks/useHnQueries";

export default function Comments() {
  const { id } = useParams<{ id: string }>();
  const storyId = parseInt(id || "0", 10);
  const [sortBy, setSortBy] = useState<"default" | "newest" | "oldest">(
    "default"
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Track online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Use the tanstack query hook for data fetching with caching
  const {
    data,
    isLoading: loading,
    error: queryError,
    isStale,
    isFetching,
  } = useStoryWithComments(storyId);

  // Check if data is from cache
  const isFromCache = !loading && !isFetching && isStale;

  // Destructure data from the query with type assertion
  const typedData = data as
    | { story: Story | null; comments: Comment[] }
    | undefined;
  const story = typedData?.story || null;
  const comments = typedData?.comments || [];
  const error =
    queryError && isOnline
      ? "Failed to load story and comments"
      : !storyId
      ? "Invalid story ID"
      : null;

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

  if (loading && !story) {
    return (
      <PageLayout>
        <div className="container max-w-5xl py-8">
          <div className="text-center py-12">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-hn-orange border-r-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-4 text-muted-foreground">
              Loading story and comments...
            </p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !story) {
    return (
      <PageLayout>
        <div className="container max-w-5xl py-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-hn-orange mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          {!isOnline && !story ? (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <WifiOff className="h-5 w-5 mr-2" />
                <h3 className="font-medium">You're offline</h3>
              </div>
              <p>
                No cached data available for this story. Please connect to the
                internet to load it.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error || "Story not found"}
            </div>
          )}
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container max-w-5xl py-8">
        <div className="flex items-center justify-between mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-hn-orange"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <div className="flex gap-2">
            {!isOnline && (
              <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-md">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline Mode
              </div>
            )}
            {isFromCache && (
              <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                <Database className="h-3 w-3 mr-1" />
                Cached data
              </div>
            )}
          </div>
        </div>

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
                      <Link
                        to={`/user/${story.user}`}
                        className="hover:text-hn-orange font-medium"
                      >
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
                    {story.tags.map((tag) => (
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
                className={`${
                  sortBy === "default"
                    ? "text-hn-orange font-medium"
                    : "text-muted-foreground"
                } hover:text-hn-orange`}
              >
                Default
              </button>
              <button
                onClick={() => setSortBy("newest")}
                className={`${
                  sortBy === "newest"
                    ? "text-hn-orange font-medium"
                    : "text-muted-foreground"
                } hover:text-hn-orange`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`${
                  sortBy === "oldest"
                    ? "text-hn-orange font-medium"
                    : "text-muted-foreground"
                } hover:text-hn-orange`}
              >
                Oldest
              </button>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="space-y-4">
          {sortedComments().length > 0 ? (
            sortedComments().map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No comments yet.
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
