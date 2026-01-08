import { Bell, Check, Trash2, X, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessages';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-l-green-500';
      case 'warning':
        return 'bg-yellow-500/10 border-l-yellow-500';
      case 'error':
        return 'bg-red-500/10 border-l-red-500';
      default:
        return 'bg-primary/10 border-l-primary';
    }
  };

  return (
    <div
      className={cn(
        'p-3 border-l-4 cursor-pointer transition-colors hover:bg-accent/50',
        getTypeStyles(notification.type),
        !notification.read && 'bg-opacity-100',
        notification.read && 'opacity-60'
      )}
      onClick={() => onClick(notification)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium truncate', !notification.read && 'font-semibold')}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {!notification.read && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notification.id);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function MessageNotificationItem({
  conversation,
  onClick,
}: {
  conversation: any;
  onClick: (conversationId: string) => void;
}) {
  return (
    <div
      className="p-3 border-l-4 border-l-blue-500 bg-blue-500/10 cursor-pointer transition-colors hover:bg-accent/50"
      onClick={() => onClick(conversation.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-blue-500" />
            <p className="text-sm font-semibold truncate">
              {conversation.listing?.title || 'New Message'}
            </p>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
            {conversation.lastMessage?.content || 'No messages yet'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {conversation.lastMessage?.created_at
              ? formatDistanceToNow(new Date(conversation.lastMessage.created_at), { addSuffix: true })
              : ''}
          </p>
        </div>
        {conversation.unreadCount > 0 && (
          <Badge className="h-5 px-2 text-[10px]">
            {conversation.unreadCount}
          </Badge>
        )}
      </div>
    </div>
  );
}

export function NotificationDropdown({ onLoginRequired }: { onLoginRequired?: () => void }) {
  const { user, roles } = useAuth();
  const navigate = useNavigate();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification } =
    useNotifications();
  const { conversations } = useConversations();

  const unreadConversations = conversations.filter(c => c.unreadCount && c.unreadCount > 0);
  const totalUnread = unreadCount + unreadConversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleMessageClick = (conversationId: string) => {
    const basePath = roles.includes('vendor') ? '/vendor/messages' : '/customer/messages';
    navigate(`${basePath}/${conversationId}`);
  };

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative" 
        onClick={() => onLoginRequired ? onLoginRequired() : navigate('/auth')}
      >
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
              {totalUnread > 9 ? '9+' : totalUnread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 && unreadConversations.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {unreadConversations.map((conversation) => (
                <MessageNotificationItem
                  key={conversation.id}
                  conversation={conversation}
                  onClick={handleMessageClick}
                />
              ))}
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
