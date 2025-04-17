import { useQuery } from "@tanstack/react-query";
import {
  fetchStoryIds,
  fetchStories,
  fetchStoryWithComments,
  fetchUser,
  Story,
  Comment,
  HNUser,
} from "@/services/hnService";

// Constants for cache time and stale time
const CACHE_TIME = 1000 * 60 * 5; // 5 minutes
const STALE_TIME = 1000 * 60 * 5; // 5 minutes - match the requirement exactly

// Common query options - without typing to avoid TS conflicts
const commonOptions = {
  gcTime: CACHE_TIME,
  staleTime: STALE_TIME,
  refetchOnMount: false,
  refetchOnReconnect: false,
  // This is critical - tell React Query to return cached data when offline
  networkMode: "always",
  // Don't try to refetch indefinitely in offline mode
  retry: navigator.onLine ? 1 : false,
};

// Query keys
export const queryKeys = {
  storyIds: (storyType: string) => ["storyIds", storyType],
  // For stories, use stringified IDs to ensure stable reference
  stories: (ids: number[], limit: number) => [
    "stories",
    JSON.stringify(ids.slice(0, limit)),
  ],
  storyWithComments: (id: number) => ["story", "comments", id],
  user: (username: string) => ["user", username],
};

// Custom hook to fetch story IDs
export function useStoryIds(
  storyType: "top" | "new" | "best" | "ask" | "show" | "job"
) {
  return useQuery({
    queryKey: queryKeys.storyIds(storyType),
    queryFn: () => fetchStoryIds(storyType),
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: "always",
    retry: navigator.onLine ? 1 : false,
  });
}

// Custom hook to fetch stories
export function useStories(ids: number[], limit: number = 12) {
  return useQuery({
    queryKey: queryKeys.stories(ids, limit),
    queryFn: () => fetchStories(ids, limit),
    enabled: ids.length > 0, // Only run query if we have IDs
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: "always",
    retry: navigator.onLine ? 1 : false,
  });
}

// Custom hook to fetch a story with its comments
export function useStoryWithComments(id: number) {
  return useQuery<{ story: Story | null; comments: Comment[] }>({
    queryKey: queryKeys.storyWithComments(id),
    queryFn: () => fetchStoryWithComments(id),
    enabled: id > 0, // Only run query if we have a valid ID
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: "always",
    retry: navigator.onLine ? 1 : false,
  });
}

// Custom hook to fetch user data
export function useUser(username: string) {
  return useQuery<HNUser | null>({
    queryKey: queryKeys.user(username),
    queryFn: () => fetchUser(username),
    enabled: !!username, // Only run query if we have a username
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME,
    refetchOnMount: false,
    refetchOnReconnect: false,
    networkMode: "always",
    retry: navigator.onLine ? 1 : false,
  });
}
