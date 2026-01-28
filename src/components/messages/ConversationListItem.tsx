import { Conversation, formatMessageTime } from "@/hooks/useMessages";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ConversationListItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: () => void;
  currentUserId: string;
}

export function ConversationListItem({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
}: ConversationListItemProps) {
  const isVendor = currentUserId === conversation.vendorId;
  const otherUserName = isVendor 
    ? conversation.customer?.name || "Customer"
    : conversation.vendor?.name || "Vendor";
  const isCustomer = currentUserId === conversation.customerId;
  const unreadCount = isCustomer ? conversation.customerUnreadCount : conversation.vendorUnreadCount;
  const hasUnread = (unreadCount || 0) > 0;
  
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 p-4 hover:bg-accent/50 transition-all text-left border-l-2",
        isSelected ? "bg-accent border-l-primary" : "border-l-transparent",
        hasUnread && "bg-accent/30"
      )}
    >
      <Avatar className="h-12 w-12 border-2 border-background">
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {otherUserName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn(
            "font-medium text-sm truncate",
            hasUnread && "font-semibold"
          )}>
            {otherUserName}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatMessageTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground truncate">
          {conversation.job?.title || "Job listing"}
        </p>
        
        {conversation.lastMessage && (
          <p className={cn(
            "text-sm truncate",
            hasUnread ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {conversation.lastMessage.split(' ').slice(0, 3).join(' ')}{conversation.lastMessage.split(' ').length > 3 ? '...' : ''}
          </p>
        )}
      </div>
      
      {hasUnread && (
        <Badge className="h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-xs">
          {unreadCount}
        </Badge>
      )}
    </button>
  );
}
