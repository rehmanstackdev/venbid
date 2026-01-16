import { useState, useRef, useEffect } from "react";
import { Send, ArrowLeft, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Conversation, useConversationMessages, formatChatTime } from "@/hooks/useMessages";
import { useSendMessage } from "@/hooks/useSendMessage";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBlocking } from "@/hooks/useBlocking";
import { jobsApi, Job } from "@/api/jobs";

interface ChatInterfaceProps {
  conversation: Conversation;
  onBack?: () => void;
}

export function ChatInterface({ conversation, onBack }: ChatInterfaceProps) {
  const { messages, refetch } = useConversationMessages(conversation.id);
  const { user } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevMessageCountRef = useRef(messages.length);

  const isVendor = user?.id === conversation.vendor_id;
  const otherPartyId = isVendor ? conversation.customer_id : conversation.vendor_id;
  const otherPartyName = isVendor
    ? conversation.customer?.name || "Customer"
    : conversation.vendor?.name || "Vendor";
  
  const { sendMessage, sending } = useSendMessage(
    conversation.id,
    conversation.listing_id,
    otherPartyId
  );

  const listingImage = conversation.listing?.images?.[0] || "/placeholder.svg";
  const listingTitle = conversation.listing?.title || "Job listing";
  const categoryName = conversation.listing?.category_name || "";

 
  useEffect(() => {
    if (scrollRef.current && messages.length > prevMessageCountRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    prevMessageCountRef.current = messages.length;
  }, [messages]);

  
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation.id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
      setTimeout(() => refetch(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShowJobDetails = async () => {
    try {
      const job = await jobsApi.getJobById(conversation.listing_id);
      setJobDetails(job);
      setShowJobDialog(true);
    } catch (error) {
      console.error('Error fetching job details:', error);
    }
  };

  
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
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
   
      <div className="flex items-center gap-3 p-4 border-b border-border bg-card shrink-0">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        <button onClick={handleShowJobDetails}>
          <img
            src={listingImage}
            alt=""
            className="w-10 h-10 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
          />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold truncate">{otherPartyName}</h2>
            {!isVendor && conversation.vendor?.documentVerified !== undefined && (
              <Badge variant={conversation.vendor.documentVerified ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                {conversation.vendor.documentVerified ? "Verified" : "Unverified"}
              </Badge>
            )}
          </div>
          <button
            onClick={handleShowJobDetails}
            className="text-xs text-primary hover:underline truncate block text-left"
          >
            {listingTitle}
          </button>
        </div>
      </div>

   
      <div className="flex-1 overflow-y-auto p-4 pb-2 overscroll-contain min-h-0" ref={scrollRef}>
        <div className="flex flex-col space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedMessages).map(([date, dayMessages]) => (
              <div key={date}>
            
                <div className="flex items-center justify-center mb-4">
                  <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                    {formatDateHeader(date)}
                  </span>
                </div>

               
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
              ))}
            </div>
          )}
        </div>
      </div>

 
      <div className="p-4 border-t border-border bg-card shrink-0">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button 
            onClick={handleSend} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

  
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
          </DialogHeader>
          {jobDetails && (
            <div className="space-y-4">
              {jobDetails.images && jobDetails.images.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {jobDetails.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Job image ${idx + 1}`}
                      className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedImage(img);
                        setShowImageDialog(true);
                      }}
                    />
                  ))}
                </div>
              )}
              <div>
                <h3 className="font-semibold text-lg break-words">{jobDetails.title}</h3>
                <Badge variant="secondary" className="mt-1">{jobDetails.category}</Badge>
              </div>
              <div className="w-full overflow-hidden">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1 break-words flex-wrap w-80">{jobDetails.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                <p className="text-sm mt-1">${jobDetails.budget}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Location</p>
                <p className="text-sm mt-1 break-words">
                  {jobDetails.showExactAddress
                    ? `${jobDetails.street}, ${jobDetails.city}, ${jobDetails.zip}`
                    : `${jobDetails.crossStreet}, ${jobDetails.city}, ${jobDetails.zip}`}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

   
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setShowImageDialog(false)}
            >
              <X className="h-6 w-6" />
            </Button>
            <img
              src={selectedImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
