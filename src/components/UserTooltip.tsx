import { useState, useEffect, ReactNode } from "react";
import { Link } from "react-router-dom";
import { User, Calendar, Award, FileText } from "lucide-react";
import { fetchUser, formatDate, HNUser } from "@/services/hnService";

interface UserTooltipProps {
  username: string;
  children: ReactNode;
}

export function UserTooltip({ username, children }: UserTooltipProps) {
  const [userData, setUserData] = useState<HNUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null);

  const loadUserData = async () => {
    if (userData || loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const user = await fetchUser(username);
      setUserData(user);
    } catch (err) {
      setError("Failed to load user data");
      console.error(`Error fetching user ${username}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      setTooltipTimeout(null);
    }
    
    // Start loading user data
    loadUserData();
    
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
        className="inline-block"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </div>
      
      {isVisible && (
        <div 
          className="absolute z-50 mt-2 -left-4"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="bg-card shadow-lg rounded-lg border p-4 w-64">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 border-2 border-hn-orange border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : error ? (
              <div className="text-sm text-red-500">{error}</div>
            ) : userData ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-hn-orange/10 text-hn-orange rounded-full flex items-center justify-center font-medium text-lg">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold">{userData.id}</div>
                    <div className="text-xs text-muted-foreground">Hacker News User</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Account created on {formatDate(userData.created)}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{userData.karma.toLocaleString()}</span> karma points
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>
                      <span className="font-medium">{userData.submitted?.length.toLocaleString() || 0}</span> submissions
                    </span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t">
                  <Link 
                    to={`/user/${userData.id}`}
                    className="text-xs text-hn-orange hover:underline inline-flex items-center gap-1"
                  >
                    <User className="h-3 w-3" />
                    View profile
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">No user data available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 