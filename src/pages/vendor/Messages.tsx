import { useState } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversations } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { ConversationListItem } from "@/components/messages/ConversationListItem";
import VendorMessageDetail from "./MessageDetail";

export default function VendorMessages() {
  const { id } = useParams();
  const { conversations, loading } = useConversations();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(id || null);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const listingTitle = conv.listing?.title?.toLowerCase() || '';
    const lastMsg = conv.lastMessage?.content?.toLowerCase() || '';
    return listingTitle.includes(searchLower) || lastMsg.includes(searchLower);
  });

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
    <div className="flex h-screen bg-background">
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-lg font-semibold mb-3">Messages</h1>
          {conversations.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
        <ScrollArea className="flex-1">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <div className="rounded-full bg-primary/10 p-4 mb-3">
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">
                {searchQuery ? "No results found" : "No conversations yet"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try different keywords" : "Start a conversation"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredConversations.map((conversation) => (
                <ConversationListItem
                  key={conversation.id}
                  conversation={conversation}
                  isSelected={selectedId === conversation.id}
                  onSelect={() => setSelectedId(conversation.id)}
                  currentUserId={user?.id || ""}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Message Window */}
      <div className="flex-1">
        {selectedId ? (
          <VendorMessageDetail conversationId={selectedId} />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}