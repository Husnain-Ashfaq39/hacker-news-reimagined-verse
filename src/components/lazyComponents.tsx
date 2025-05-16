import React, { lazy, Suspense } from 'react';

// Skeleton loading component
const Skeleton = ({ lines = 3 }) => (
  <div className="animate-pulse space-y-2">
    {Array(lines).fill(0).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-muted rounded-md" 
        style={{ width: `${Math.max(50, Math.min(95, 100 - i * 10))}%` }}
      />
    ))}
  </div>
);

// Story card skeleton
const StoryCardSkeleton = () => (
  <div className="bg-card rounded-lg border p-4">
    <div className="flex gap-3">
      <div className="flex flex-col items-center pr-3 border-r">
        <div className="h-8 w-8 bg-muted rounded-full"></div>
        <div className="h-4 w-6 mt-1 bg-muted rounded-md"></div>
      </div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-muted rounded-md w-4/5"></div>
        <div className="h-3 bg-muted rounded-md w-1/4"></div>
        <div className="space-y-1">
          <div className="h-3 bg-muted rounded-md w-3/4"></div>
          <div className="h-3 bg-muted rounded-md w-1/2"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-muted rounded-md"></div>
          <div className="h-5 w-16 bg-muted rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
);

// News summary skeleton
const NewsSummarySkeleton = () => (
  <div className="bg-card rounded-lg border p-4 space-y-3">
    <div className="h-6 bg-muted rounded-md w-1/2"></div>
    <div className="h-4 bg-muted rounded-md w-full"></div>
    <div className="h-4 bg-muted rounded-md w-5/6"></div>
    <div className="h-4 bg-muted rounded-md w-4/5"></div>
    <div className="flex justify-end">
      <div className="h-8 w-24 bg-muted rounded-md"></div>
    </div>
  </div>
);

// Comment skeleton
const CommentItemSkeleton = () => (
  <div className="border-l-2 border-muted pl-4 py-2 space-y-2">
    <div className="flex items-center gap-2">
      <div className="h-4 w-24 bg-muted rounded-md"></div>
      <div className="h-4 w-16 bg-muted rounded-md"></div>
    </div>
    <div className="space-y-1.5">
      <div className="h-3.5 bg-muted rounded-md w-full"></div>
      <div className="h-3.5 bg-muted rounded-md w-11/12"></div>
      <div className="h-3.5 bg-muted rounded-md w-4/5"></div>
    </div>
  </div>
);

// Lazily load heavy components with the correct module structure
export const LazyNewsSummary = lazy(() => 
  import('./NewsSummary').then(module => ({ default: module.NewsSummary }))
);

export const LazyPromotedStory = lazy(() => 
  import('./PromotedStory').then(module => ({ default: module.PromotedStory }))
);

export const LazyStoryCard = lazy(() => 
  import('./StoryCard').then(module => ({ default: module.StoryCard }))
);

export const LazyCommentItem = lazy(() => 
  import('./CommentItem').then(module => ({ default: module.CommentItem }))
);

// Wrapper components with suspense fallbacks
export const NewsSummaryWithSuspense = (props: React.ComponentProps<typeof LazyNewsSummary>) => (
  <Suspense fallback={<NewsSummarySkeleton />}>
    <LazyNewsSummary {...props} />
  </Suspense>
);

export const PromotedStoryWithSuspense = (props: React.ComponentProps<typeof LazyPromotedStory>) => (
  <Suspense fallback={<StoryCardSkeleton />}>
    <LazyPromotedStory {...props} />
  </Suspense>
);

export const StoryCardWithSuspense = (props: React.ComponentProps<typeof LazyStoryCard>) => (
  <Suspense fallback={<StoryCardSkeleton />}>
    <LazyStoryCard {...props} />
  </Suspense>
);

export const CommentItemWithSuspense = (props: React.ComponentProps<typeof LazyCommentItem>) => (
  <Suspense fallback={<CommentItemSkeleton />}>
    <LazyCommentItem {...props} />
  </Suspense>
); 