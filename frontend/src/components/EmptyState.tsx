import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

interface EmptyStateProps {
  /** Icon component to display */
  icon: ReactNode;
  /** Main title text */
  title: string;
  /** Optional description text */
  description?: string;
  /** Optional action button or element */
  action?: ReactNode;
  /** Optional custom class name */
  className?: string;
}

/**
 * EmptyState component provides a consistent design for empty states
 * throughout the application.
 *
 * Features:
 * - Customizable icon, title, and description
 * - Optional action button
 * - Fade-in animation on mount
 * - Centered layout with proper spacing
 * - Responsive text sizing
 *
 * @example
 * ```tsx
 * <EmptyState
 *   icon={<FileTextIcon className="h-12 w-12 text-muted-foreground" />}
 *   title="No Documents"
 *   description="Upload a document to get started"
 *   action={<Button>Upload Now</Button>}
 * />
 * ```
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`fade-in ${className}`}>
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 rounded-full bg-muted p-4">{icon}</div>

        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

        {description && (
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
