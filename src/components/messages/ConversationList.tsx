import { Conversation, formatMessageTime, currentUser } from "@/data/mockMessages";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="rounded-full bg-muted p-4 mb-3">
          <svg
            className="h-8 w-8 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h3 className="font-medium text-foreground mb-1">No messages yet</h3>
        <p className="text-sm text-muted-foreground">
          When vendors message you about your jobs, they'll appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conversation) => {
        const isSelected = selectedId === conversation.id;
        const otherPartyName = currentUser.type === "customer" 
          ? conversation.vendorName 
          : conversation.customerName;

        return (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full flex gap-3 p-4 text-left transition-colors hover:bg-accent",
              isSelected && "bg-accent"
            )}
          >
            {/* Listing image */}
            <div className="relative flex-shrink-0">
              <img
                src={conversation.listingImage}
                alt=""
                className="w-14 h-14 rounded-lg object-cover"
              />
              {conversation.unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-medium">
                  {conversation.unreadCount}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className={cn(
                  "font-medium text-sm truncate",
                  conversation.unreadCount > 0 && "text-foreground",
                  conversation.unreadCount === 0 && "text-muted-foreground"
                )}>
                  {otherPartyName}
                </span>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatMessageTime(conversation.lastMessageAt)}
                </span>
              </div>
              
              <p className="text-xs text-muted-foreground truncate mb-1">
                Re: {conversation.listingTitle}
              </p>
              
              <p className={cn(
                "text-sm truncate",
                conversation.unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {conversation.lastMessage}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
