import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Comments from "./pages/Comments";
import NotFound from "./pages/NotFound";
import { useState, useEffect } from "react";
import { persistQueryClient } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

// Create persister to store cache in localStorage
const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "HN_REACT_QUERY_CACHE",
  throttleTime: 1000, // Throttle writing to storage (ms)
  serialize: (data) => JSON.stringify(data),
  deserialize: (data) => JSON.parse(data),
});

const App = () => {
  // Track online status
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Create a stable QueryClient instance that persists between renders
  const [queryClient] = useState(() => {
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 10, // 10 minutes
          refetchOnWindowFocus: false,
          retry: isOnline ? 1 : false, // Don't retry when offline
          // Critically important for offline support
          networkMode: "always", // Continue showing cached data even offline
        },
      },
    });

    // Setup persistence after client creation
    persistQueryClient({
      queryClient: client,
      persister: localStoragePersister,
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
      dehydrateOptions: {
        shouldDehydrateQuery: (query) => {
          // Only cache successful queries
          return query.state.status === "success";
        },
      },
    });

    return client;
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/newest" element={<Index />} />
            <Route path="/ask" element={<Index />} />
            <Route path="/show" element={<Index />} />
            <Route path="/jobs" element={<Index />} />
            <Route path="/item/:id" element={<Comments />} />
            <Route path="/user/:username" element={<Index />} />
            <Route path="/from/:domain" element={<Index />} />
            <Route path="/tag/:tag" element={<Index />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      {/* Add React Query Devtools for development environment */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default App;
