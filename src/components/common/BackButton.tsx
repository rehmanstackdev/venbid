import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  className?: string;
  variant?: "default" | "ghost" | "outline" | "secondary" | "destructive" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  showIcon?: boolean;
}

export function BackButton({
  className,
  variant = "ghost",
  size = "sm",
  label = "Back",
  showIcon = true
}: BackButtonProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleBack}
    >
      {showIcon && <ArrowLeft className="h-4 w-4 mr-2" />}
      {label}
    </Button>
  );
}
