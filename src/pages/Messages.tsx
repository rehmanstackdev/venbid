import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ChatInterface } from "@/components/messages/ChatInterface";
import { ConversationListItem } from "@/components/messages/ConversationListItem";

const Messages = () => {
  const [searchParams] = useSearchParams();
  const { conversations, loading } = useConversations();
  const { user, isVendor } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    searchParams.get("conversation")
  );

  useEffect(() => {
    const convParam = searchParams.get("conversation");
    if (convParam) {
      setSelectedConversationId(convParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!loading && conversations.length > 0 && selectedConversationId) {
      const found = conversations.find(c => c.id === selectedConversationId);
      if (!found) {
        console.log('Conversation not found, available:', conversations.map(c => c.id));
        console.log('Looking for:', selectedConversationId);
      }
    }
  }, [conversations, selectedConversationId, loading]);

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
   
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-semibold">Messages</h1>
            {totalUnread > 0 && (
              <p className="text-xs text-muted-foreground">
                {totalUnread} unread {totalUnread === 1 ? "message" : "messages"}
              </p>
            )}
          </div>
        </div>
      </header>

     
      <div className="flex-1 flex">
    
        <aside
          className={cn(
            "w-full lg:w-96 border-r border-border bg-card",
            selectedConversationId && "hidden lg:block"
          )}
        >
          <ScrollArea className="h-[calc(100vh-3.5rem)]">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center p-6">
                <div className="rounded-full bg-muted p-4 mb-3">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">No conversations yet</h3>
                <p className="text-sm text-muted-foreground">
                  {isVendor 
                    ? "Message customers about their job listings to start a conversation"
                    : "When vendors message you about your listings, they'll appear here"
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedConversationId === conversation.id}
                    onSelect={() => setSelectedConversationId(conversation.id)}
                    currentUserId={user?.id || ""}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

   
        <main
          className={cn(
            "flex-1 bg-background",
            !selectedConversationId && "hidden lg:flex"
          )}
        >
          {selectedConversation ? (
            <ChatInterface
              conversation={selectedConversation}
              onBack={() => setSelectedConversationId(null)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 ">
              <div className="rounded-full bg-muted p-6 mb-4">
                <MessageSquare className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium mb-1">Select a conversation</h2>
              <p className="text-muted-foreground text-sm">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Messages;
