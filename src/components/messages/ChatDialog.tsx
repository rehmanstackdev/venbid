import { useState, useRef, useEffect } from "react";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { chatApi } from "@/api/chat";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { getChatSocket, initChatSocket, joinConversation, leaveConversation } from "@/lib/chatSocket";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  jobTitle: string;
  customerId: string;
  conversationId?: string;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export function ChatDialog({ open, onOpenChange, jobId, jobTitle, customerId, conversationId }: ChatDialogProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentConvId, setCurrentConvId] = useState(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && currentConvId) {
      loadMessages();
      inputRef.current?.focus();
     
      const token = localStorage.getItem('access_token');
      if (token) {
        const socket = initChatSocket(token);
        
        if (socket?.connected) {
          joinConversation(currentConvId);
          
          socket.on('newMessage', (data: any) => {
            if (data.conversationId === currentConvId) {
              setMessages(prev => [...prev, {
                id: data.message.id,
                senderId: data.message.senderId,
                content: data.message.content,
                createdAt: data.message.createdAt,
              }]);
              if (data.message.senderId !== user?.id) {
                toast.info('New message received');
              }
            }
          });
          
          return () => {
            leaveConversation(currentConvId);
            socket.off('newMessage');
          };
        }
      }
    }
  }, [open, currentConvId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    if (!currentConvId) return;
    setLoading(true);
    try {
      const apiMessages = await chatApi.getMessages(currentConvId);
      setMessages(apiMessages.map(m => ({
        id: m.id,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt,
      })));
      await chatApi.markAsRead(currentConvId);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await chatApi.sendMessage({
        jobId,
        recipientId: customerId,
        content: newMessage.trim(),
      });

      if (!currentConvId) {
        setCurrentConvId(response.conversationId);
      }

      setMessages(prev => [...prev, {
        id: response.id,
        senderId: response.senderId,
        content: response.content,
        createdAt: response.createdAt,
      }]);
      setNewMessage("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { 
      hour: "numeric", 
      minute: "2-digit",
      hour12: true 
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="text-base">Message about: {jobTitle}</DialogTitle>
          <DialogDescription className="sr-only">Chat conversation about the job</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Start the conversation by sending a message
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={cn("flex", isOwn ? "justify-end" : "justify-start")}
                  >
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2",
                        isOwn
                          ? "bg-primary text-primary-foreground rounded-br-md"
                          : "bg-muted text-foreground rounded-bl-md"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p
                        className={cn(
                          "text-[10px] mt-1",
                          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={sending}
            />
            <Button onClick={handleSend} disabled={!newMessage.trim() || sending} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
