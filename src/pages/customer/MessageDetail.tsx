import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useConversations, useConversationMessages } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useAuth } from "@/hooks/useAuth";

export default function CustomerMessageDetail({ conversationId, onBack }: { conversationId: string; onBack?: () => void }) {
  const navigate = useNavigate();
  const { conversations } = useConversations();
  const { messages, refetch } = useConversationMessages(conversationId);
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const conversation = conversations.find((c) => c.id === conversationId);
  
  const isCustomer = user?.id === conversation?.customer_id;
  const otherPartyId = isCustomer ? conversation?.vendor_id : conversation?.customer_id;
  const otherPartyName = isCustomer
    ? `${conversation?.vendor?.firstName || ''} ${conversation?.vendor?.lastName || ''}`.trim() || "Vendor"
    : `${conversation?.customer?.firstName || ''} ${conversation?.customer?.lastName || ''}`.trim() || "Customer";
  
  const { sendMessage: send, sending } = useSendMessage(
    conversationId,
    conversation?.listing_id || '',
    otherPartyId || ''
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Conversation not found</p>
      </div>
    );
  }

  const handleSend = async () => {
    if (!message.trim() || sending || !conversation) return;
    const success = await send(message);
    if (success) {
      setMessage("");
      setTimeout(() => {
        refetch();
      }, 100);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="border-b border-border bg-card p-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarFallback>{otherPartyName[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold">{otherPartyName}</h1>
            <button
              onClick={() => navigate(`/listing/${conversation.listing_id}`)}
              className="text-xs text-primary hover:underline truncate block text-left"
            >
              {conversation.listing?.title}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto" ref={scrollRef}>
        <div className="p-4 space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[70%] rounded-lg p-3 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-xs mt-1 ${isOwn ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-border bg-card p-4 flex-shrink-0">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          />
          <Button onClick={handleSend} size="icon" disabled={sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
