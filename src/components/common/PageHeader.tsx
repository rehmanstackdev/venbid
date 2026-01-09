import { BackButton } from "./BackButton";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  backButtonLabel?: string;
  backButtonVariant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  showBackButton = true,
  backButtonLabel = "Back",
  backButtonVariant = "ghost",
  className,
  children
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {showBackButton && (
        <BackButton variant={backButtonVariant} label={backButtonLabel} />
      )}

      {(title || description) && (
        <div className="space-y-2">
          {title && (
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
