import { Skeleton } from "@/components/ui/skeleton";

interface MessageSkeletonProps {
  /** Whether this is a user or assistant message */
  variant?: "user" | "assistant";
  /** Number of skeleton lines to show */
  lines?: number;
  /** Optional custom class name */
  className?: string;
}

/**
 * MessageSkeleton component displays a loading skeleton for chat messages.
 * Used while messages are being loaded or sent.
 *
 * Features:
 * - Matches actual message layout
 * - Animated shimmer effect
 * - Supports user and assistant variants
 * - Configurable number of text lines
 * - Fade-in animation
 *
 * @example
 * ```tsx
 * // Show assistant message loading
 * <MessageSkeleton variant="assistant" lines={3} />
 *
 * // Show user message loading
 * <MessageSkeleton variant="user" lines={2} />
 * ```
 */
export function MessageSkeleton({
  lines = 2,
  className = "",
}: MessageSkeletonProps) {
  return (
    <div className={`flex items-start gap-3 fade-in ${className}`}>
      {/* Avatar skeleton */}
      <Skeleton className="h-8 w-8 rounded-full" />

      <div className="flex-1 space-y-2">
        {/* Name/role skeleton */}
        <Skeleton className="h-4 w-24" />

        {/* Message content skeleton */}
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, index) => (
            <Skeleton
              key={index}
              className="h-4"
              style={{
                width: index === lines - 1 ? "70%" : "100%",
              }}
            />
          ))}
        </div>

        {/* Timestamp skeleton */}
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

/**
 * MessageSkeletonList component displays multiple message skeletons
 * for initial loading state.
 */
export function MessageSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, index) => (
        <MessageSkeleton
          key={index}
          variant={index % 2 === 0 ? "assistant" : "user"}
          lines={Math.floor(Math.random() * 3) + 1}
        />
      ))}
    </div>
  );
}
