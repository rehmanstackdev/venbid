import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type VerificationStatus = 'unverified' | 'pending' | 'verified';

interface VerificationBadgeProps {
  status: VerificationStatus;
  className?: string;
  showIcon?: boolean;
}

export function VerificationBadge({ status, className, showIcon = true }: VerificationBadgeProps) {
  const config = {
    verified: {
      label: 'Verified',
      icon: CheckCircle2,
      variant: 'default' as const,
      className: 'bg-verified text-verified-foreground hover:bg-verified/90',
    },
    pending: {
      label: 'Pending',
      icon: Clock,
      variant: 'secondary' as const,
      className: 'bg-warning/10 text-warning border-warning/20',
    },
    unverified: {
      label: 'Unverified',
      icon: AlertCircle,
      variant: 'outline' as const,
      className: 'text-muted-foreground',
    },
  };

  const { label, icon: Icon, className: statusClassName } = config[status];

  return (
    <Badge 
      variant="outline"
      className={cn('text-[10px] px-1.5 py-0 font-normal', statusClassName, className)}
    >
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {label}
    </Badge>
  );
}
