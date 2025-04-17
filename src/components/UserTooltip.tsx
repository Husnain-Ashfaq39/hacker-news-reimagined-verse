import { useState, useEffect, ReactNode, useRef } from "react";
import { Link } from "react-router-dom";
import { User, Calendar, Award, FileText } from "lucide-react";
import { formatDate, HNUser } from "@/services/hnService";
import { useUser } from "@/hooks/useHnQueries";

interface UserTooltipProps {
  username: string;
  children: ReactNode;
  position?: "top" | "bottom" | "auto";
}

export function UserTooltip({
  username,
  children,
  position = "auto",
}: UserTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState<"top" | "bottom">(
    "bottom"
  );

  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Use the cached query hook instead of direct fetching
  const { data: userData, isLoading: loading, error } = useUser(username);

  // Type assertion for the user data
  const typedUserData = userData as HNUser | null;

  // Calculate optimal position for tooltip
  const calculatePosition = () => {
    if (position !== "auto") {
      setTooltipPosition(position);
      return;
    }

    if (!triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const tooltipHeight = 200; // Approximate height of tooltip

    // If there's not enough space below, show tooltip above
    if (spaceBelow < tooltipHeight && triggerRect.top > tooltipHeight) {
      setTooltipPosition("top");
    } else {
      setTooltipPosition("bottom");
    }
  };

  const handleMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }

    calculatePosition();

    // Show tooltip after a small delay to prevent flickering on quick mouse movements
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    setTooltipTimeout(timeout);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }

    // Hide tooltip with a small delay to make it easier to move mouse to tooltip
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 300);

    setTooltipTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
      }
    };
  }, [tooltipTimeout]);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-[100] ${
            tooltipPosition === "top" ? "bottom-0 mb-2" : "top-0 mt-2"
          }`}
          style={{
            left: triggerRef.current
              ? triggerRef.current.getBoundingClientRect().left - 10 + "px"
              : "0",
            [tooltipPosition === "top" ? "bottom" : "top"]: triggerRef.current
              ? (tooltipPosition === "top"
                  ? window.innerHeight -
                    triggerRef.current.getBoundingClientRect().top +
                    5
                  : triggerRef.current.getBoundingClientRect().bottom + 5) +
                "px"
              : "0",
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-card shadow-lg rounded-lg border p-4 w-64 max-w-xs">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 border-2 border-hn-orange border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">
                Failed to load user data
              </div>
            ) : typedUserData ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-hn-orange/10 text-hn-orange rounded-full flex items-center justify-center font-medium text-lg">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{typedUserData.id}</div>
                    <div className="text-xs text-muted-foreground">
                      Hacker News User
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Account created on {formatDate(typedUserData.created)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">
                        {typedUserData.karma.toLocaleString()}
                      </span>{" "}
                      karma points
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">
                        {typedUserData.submitted?.length.toLocaleString() || 0}
                      </span>{" "}
                      submissions
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <Link
                    to={`/user/${typedUserData.id}`}
                    className="text-xs text-hn-orange hover:underline inline-flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    View profile
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                No user data available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
