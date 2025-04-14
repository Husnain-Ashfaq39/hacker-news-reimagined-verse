import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, Reply } from "lucide-react";
import { Comment } from "@/services/hnService";
import { UserTooltip } from "@/components/UserTooltip";

interface CommentItemProps {
  comment: Comment;
}

export function CommentItem({ comment }: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasReplies = comment.kids && comment.kids.length > 0;
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };
  
  if (comment.deleted) {
    return (
      <div 
        className="comment py-3 pl-4 pr-2 text-sm text-muted-foreground italic"
        style={{ marginLeft: `${comment.level * 20}px` }}
      >
        [comment deleted]
      </div>
    );
  }
  
  if (comment.dead) {
    return null;
  }
  
  return (
    <div className="comment-thread">
      <div 
        className="comment py-3 pl-4 pr-2 border-l-2 border-muted hover:border-hn-orange/50"
        style={{ marginLeft: `${comment.level * 20}px` }}
      >
        <div className="flex items-center gap-2 mb-1 text-xs text-muted-foreground">
          <UserTooltip username={comment.user}>
            <Link to={`/user/${comment.user}`} className="font-medium hover:text-hn-orange">
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
                className="flex items-center hover:text-hn-orange"
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
              className="comment-text text-sm prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: comment.text }}
            />
            
            <div className="flex items-center gap-2 mt-2 text-xs">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-hn-orange">
                <Reply className="h-3 w-3" />
                <span>Reply</span>
              </button>
            </div>
          </>
        )}
      </div>
      
      {isExpanded && hasReplies && comment.kids?.map(kid => (
        <CommentItem key={kid.id} comment={kid} />
      ))}
    </div>
  );
} 