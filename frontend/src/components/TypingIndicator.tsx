import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RocketIcon } from "@radix-ui/react-icons";

interface TypingIndicatorProps {
  /** Optional custom class name for styling */
  className?: string;
}

/**
 * TypingIndicator component displays an animated typing indicator
 * to show when the AI assistant is processing a response.
 *
 * Features:
 * - Three animated dots with staggered timing
 * - AI assistant avatar
 * - Smooth slide-up animation on mount
 * - Matches chat message styling
 *
 * @example
 * ```tsx
 * {isTyping && <TypingIndicator />}
 * ```
 */
export function TypingIndicator({ className = "" }: TypingIndicatorProps) {
  return (
    <div className={`flex items-start gap-3 message-animate ${className}`}>
      <Avatar className="h-8 w-8 border-2 border-primary/10">
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
          <RocketIcon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">AI Assistant</span>
        </div>

        <div className="inline-flex items-center gap-2 rounded-lg bg-muted px-4 py-3">
          <div className="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="text-xs text-muted-foreground">Thinking...</span>
        </div>
      </div>
    </div>
  );
}
