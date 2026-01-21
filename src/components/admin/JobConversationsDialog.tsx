import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, MessageSquare, User } from 'lucide-react';
import { adminApi, JobConversation } from '@/api/admin';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface JobConversationsDialogProps {
  jobId: string | null;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function JobConversationsDialog({ jobId, jobTitle, open, onOpenChange }: JobConversationsDialogProps) {
  const [conversations, setConversations] = useState<JobConversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && jobId) {
      fetchConversations();
    }
  }, [open, jobId]);

  const fetchConversations = async () => {
    if (!jobId) return;
    
    setLoading(true);
    try {
      const data = await adminApi.getJobConversations(jobId);
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Conversations for: {jobTitle}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No conversations found for this job</p>
          </div>
        ) : (
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="border rounded-lg p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-blue-500" />
                          <span className="font-semibold text-xs sm:text-sm">Customer: {conversation.customer.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground break-all">{conversation.customer.email}</p>
                      </div>
                      <div className="hidden sm:block h-8 w-px bg-border" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <User className="h-4 w-4 text-green-500" />
                          <span className="font-semibold text-xs sm:text-sm">Vendor: {conversation.vendor.name}</span>
                        </div>
                        <p className="text-xs text-muted-foreground break-all">{conversation.vendor.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {conversation.messages.map((message) => {
                      const isCustomer = message.senderId === conversation.customerId;
                      return (
                        <div
                          key={message.id}
                          className={cn(
                            'flex',
                            isCustomer ? 'justify-start' : 'justify-end'
                          )}
                        >
                          <div
                            className={cn(
                              'max-w-[85%] sm:max-w-[70%] rounded-lg px-3 py-2',
                              isCustomer
                                ? 'bg-blue-500/10 border border-blue-500/20'
                                : 'bg-green-500/10 border border-green-500/20'
                            )}
                          >
                            <p className="text-xs sm:text-sm break-words">{message.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
