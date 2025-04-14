import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Reply, ThumbsUp } from "lucide-react";
import { Comment } from "@/services/hnService";
import { UserTooltip } from "@/components/UserTooltip";
import { cn } from "@/lib/utils";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReplies = comment.kids && comment.kids.length > 0;
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  const getBorderColor = () => {
    const colors = [
      "border-hn-orange/30",
      "border-blue-300/50",
      "border-green-300/50",
      "border-purple-300/50",
      "border-amber-300/50"
    ];
    return colors[comment.level % colors.length];
  };
  
  if (comment.deleted) {
    return (
      <div 
        className="py-2 pl-4 pr-2 text-sm text-muted-foreground italic opacity-60"
        style={{ marginLeft: `${comment.level * 24}px` }}
      >
        [comment deleted]
      </div>
    );
  }
  
  if (comment.dead) {
    return null;
  }
  
  return (
    <div className="comment-thread group mb-2">
      <div 
        className={cn(
          "comment relative py-4 pl-5 pr-3 rounded-md hover:bg-muted/30 transition-colors",
          isExpanded ? "border-l-[3px]" : "border-l-2 opacity-75",
          getBorderColor()
        )}
        style={{ marginLeft: `${Math.min(comment.level * 24, 120)}px` }}
      >
        <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
          <UserTooltip username={comment.user}>
            <Link to={`/user/${comment.user}`} className="font-semibold hover:text-hn-orange">
              {comment.user}
            </Link>
          </UserTooltip>
          <span>•</span>
          <span>{comment.time}</span>
          
          {hasReplies && (
            <>
              <span>•</span>
              <button 
                onClick={toggleExpanded} 
                className="flex items-center hover:text-hn-orange transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3 mr-1" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3 mr-1" />
                    <span>Expand {comment.kids?.length} {comment.kids?.length === 1 ? 'reply' : 'replies'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
        
        {isExpanded && (
          <>
            <div 
              className="comment-text text-sm prose prose-sm max-w-none overflow-hidden
                         break-words overflow-wrap-anywhere
                         prose-p:my-1.5 prose-a:text-hn-orange prose-a:no-underline hover:prose-a:underline
                         prose-a:break-words prose-a:overflow-wrap-anywhere prose-a:word-break-all
                         prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:break-words
                         prose-pre:bg-muted/70 prose-pre:p-3 prose-pre:rounded-md prose-pre:whitespace-pre-wrap prose-pre:break-words"
              dangerouslySetInnerHTML={{ __html: comment.text }}
            />
            
            <div className="flex items-center gap-3 mt-2 pt-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-hn-orange transition-colors">
                <ThumbsUp className="h-3 w-3" />
                <span>Upvote</span>
              </button>
              
              <button className="flex items-center gap-1 text-muted-foreground hover:text-hn-orange transition-colors">
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            </div>
          </>
        )}
        
        {hasReplies && (
          <button 
            className="absolute top-0 left-0 bottom-0 w-8 opacity-0 group-hover:opacity-30 hover:opacity-100 transition-opacity"
            onClick={toggleExpanded}
            aria-label={isExpanded ? "Collapse comment" : "Expand comment"}
          >
            <div className="flex h-full w-full items-center justify-center">
              {isExpanded ? (
                <ChevronUp className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          </button>
        )}
      </div>
      
      {isExpanded && hasReplies && (
        <div className="comment-children mt-1">
          {comment.kids?.map(kid => (
            <CommentItem key={kid.id} comment={kid} />
          ))}
        </div>
      )}
    </div>
  );
}