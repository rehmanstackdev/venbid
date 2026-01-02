import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, MoreVertical, Flag, Ban, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Conversation, useConversationMessages, formatChatTime } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlocking } from "@/hooks/useBlocking";

interface ChatInterfaceProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatInterface({ conversation, onBack }: ChatInterfaceProps) {
  const { messages, sendMessage } = useConversationMessages(conversation.id);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showBlockDialog, setShowBlockDialog] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { isBlocked, didIBlock, blockUser, unblockUser } = useBlocking();

  const isVendor = user?.id === conversation.vendor_id;
  const otherPartyId = isVendor ? conversation.customer_id : conversation.vendor_id;
  const isUserBlocked = isBlocked(otherPartyId);
  const didIBlockUser = didIBlock(otherPartyId);

  const listingImage = conversation.listing?.images?.[0] || "/placeholder.svg";
  const listingTitle = conversation.listing?.title || "Job listing";
  const categoryName = conversation.listing?.category_name || "";

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSend = async () => {
    if (!newMessage.trim() || isUserBlocked) return;
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBlock = async () => {
    await blockUser(otherPartyId);
    setShowBlockDialog(false);
  };

  const handleUnblock = async () => {
    await unblockUser(otherPartyId);
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, typeof messages>);

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-US", { 
      weekday: "long", 
      month: "short", 
      day: "numeric" 
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <Link to={`/listing/${conversation.listing_id}`}>
          <img
            src={listingImage}
            alt=""
            className="w-10 h-10 rounded-lg object-cover"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {categoryName}
            </Badge>
          </div>
          <Link 
            to={`/listing/${conversation.listing_id}`}
            className="text-sm font-medium hover:text-primary truncate block"
          >
            {listingTitle}
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {didIBlockUser ? (
              <DropdownMenuItem onClick={handleUnblock}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Unblock user
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                className="text-destructive"
                onClick={() => setShowBlockDialog(true)}
              >
                <Ban className="h-4 w-4 mr-2" />
                Block user
              </DropdownMenuItem>
            )}
            <DropdownMenuItem>
              <Flag className="h-4 w-4 mr-2" />
              Report conversation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center justify-center mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatDateHeader(date)}
                  </span>
                </div>

                {/* Messages for this day */}
                <div className="space-y-3">
                  {dayMessages.map((message) => {
                    const isOwn = message.sender_id === user?.id;

                    return (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          isOwn ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[75%] rounded-2xl px-4 py-2",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-md"
                              : "bg-muted text-foreground rounded-bl-md"
                          )}
                        >
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={cn(
                              "text-[10px] mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                            )}
                          >
                            {formatChatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input or Blocked Message */}
      {isUserBlocked ? (
        <div className="p-4 border-t border-border bg-muted/50">
          <div className="text-center py-2">
            <Ban className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
            <p className="text-sm text-muted-foreground">
              {didIBlockUser 
                ? "You blocked this user. Unblock to send messages."
                : "You can't send messages to this conversation."
              }
            </p>
            {didIBlockUser && (
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={handleUnblock}
              >
                Unblock User
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-4 border-t border-border bg-card">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="flex-1"
              disabled={isUserBlocked}
            />
            <Button 
              onClick={handleSend} 
              disabled={!newMessage.trim() || isUserBlocked}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Block Confirmation Dialog */}
      <AlertDialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block this user?</AlertDialogTitle>
            <AlertDialogDescription>
              Blocking this user will prevent both of you from sending messages to each other. 
              You can unblock them later from your settings or this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlock} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Block User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
