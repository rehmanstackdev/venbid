import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { ConversationListItem } from "@/components/messages/ConversationListItem";
import { ChatInterface } from "@/components/messages/ChatInterface";
import { cn } from "@/lib/utils";

export default function VendorMessages() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { conversations, loading } = useConversations();
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(id || null);

  useEffect(() => {
    if (id) {
      setSelectedId(id);
    }
  }, [id]);

  const selectedConversation = conversations.find((c) => c.id === selectedId);
  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card shadow-nav">
        <div className="container flex h-14 items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
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

      {/* Content */}
      <div className="flex-1 flex">
        {/* Conversation list */}
        <aside
          className={cn(
            "w-full lg:w-96 border-r border-border bg-card",
            selectedId && "hidden lg:block"
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
                  Message customers about their job listings to start a conversation
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    isSelected={selectedId === conversation.id}
                    onSelect={() => {
                      setSelectedId(conversation.id);
                      navigate(`/vendor/messages/${conversation.id}`);
                    }}
                    currentUserId={user?.id || ""}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Chat area */}
        <main
          className={cn(
            "flex-1 bg-background",
            !selectedId && "hidden lg:flex"
          )}
        >
          {selectedConversation ? (
            <ChatInterface
              conversation={selectedConversation}
              onBack={() => {
                setSelectedId(null);
                navigate('/vendor/messages');
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[-webkit-fill-available] w-[-webkit-fill-available] text-center p-6">
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
}