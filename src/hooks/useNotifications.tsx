import { useState, useEffect } from 'react';
// import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  created_at: string;
}

// Mock notifications storage
let mockNotificationsStore: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'mock-user-123',
    title: 'New message',
    message: "Mike's Plumbing sent you a message about your plumbing job",
    type: 'message',
    read: false,
    link: '/vendor/messages?conversation=conv-1',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    user_id: 'mock-user-123',
    title: 'Job posted successfully',
    message: 'Your job listing "Need plumber to fix leaking kitchen sink" is now live',
    type: 'listing',
    read: true,
    link: '/listing/1',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Mock data - filter by user
    const userNotifications = mockNotificationsStore
      .filter(n => n.user_id === user.id)
      .slice(0, 20);
    
    setNotifications(userNotifications);
    setUnreadCount(userNotifications.filter(n => !n.read).length);
    setLoading(false);

    // Commented out Supabase logic
    // const { data, error } = await supabase
    //   .from('notifications')
    //   .select('*')
    //   .eq('user_id', user.id)
    //   .order('created_at', { ascending: false })
    //   .limit(20);
    // if (error) {
    //   console.error('Error fetching notifications:', error);
    // } else {
    //   setNotifications(data || []);
    //   setUnreadCount(data?.filter(n => !n.read).length || 0);
    // }
    // setLoading(false);
  };

  const markAsRead = async (notificationId: string) => {
    // Mock mark as read
    const notifIndex = mockNotificationsStore.findIndex(n => n.id === notificationId);
    if (notifIndex !== -1) {
      mockNotificationsStore[notifIndex].read = true;
    }
    
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    
    console.log('Mock notification marked as read:', notificationId);

    // Commented out Supabase logic
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('id', notificationId);
    // if (!error) {
    //   setNotifications(prev =>
    //     prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    //   );
    //   setUnreadCount(prev => Math.max(0, prev - 1));
    // }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    // Mock mark all as read
    mockNotificationsStore = mockNotificationsStore.map(n => 
      n.user_id === user.id ? { ...n, read: true } : n
    );
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
    
    console.log('Mock all notifications marked as read');

    // Commented out Supabase logic
    // const { error } = await supabase
    //   .from('notifications')
    //   .update({ read: true })
    //   .eq('user_id', user.id)
    //   .eq('read', false);
    // if (!error) {
    //   setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    //   setUnreadCount(0);
    // }
  };

  const deleteNotification = async (notificationId: string) => {
    const notification = notifications.find(n => n.id === notificationId);
    
    // Mock delete
    mockNotificationsStore = mockNotificationsStore.filter(n => n.id !== notificationId);
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    
    console.log('Mock notification deleted:', notificationId);

    // Commented out Supabase logic
    // const { error } = await supabase
    //   .from('notifications')
    //   .delete()
    //   .eq('id', notificationId);
    // if (!error) {
    //   setNotifications(prev => prev.filter(n => n.id !== notificationId));
    //   if (notification && !notification.read) {
    //     setUnreadCount(prev => Math.max(0, prev - 1));
    //   }
    // }
  };

  const createNotification = (title: string, message: string, type: string = 'info', link: string | null = null) => {
    if (!user) return;

    const newNotification: Notification = {
      id: `notif-${Date.now()}`,
      user_id: user.id,
      title,
      message,
      type,
      read: false,
      link,
      created_at: new Date().toISOString(),
    };

    mockNotificationsStore.unshift(newNotification);
    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  useEffect(() => {
    fetchNotifications();

    // Commented out Supabase realtime subscription
    // if (!user) return;
    // const channel = supabase
    //   .channel('notifications-changes')
    //   .on('postgres_changes', {
    //     event: 'INSERT',
    //     schema: 'public',
    //     table: 'notifications',
    //     filter: `user_id=eq.${user.id}`,
    //   }, (payload) => {
    //     const newNotification = payload.new as Notification;
    //     setNotifications(prev => [newNotification, ...prev]);
    //     setUnreadCount(prev => prev + 1);
    //   })
    //   .on('postgres_changes', {
    //     event: 'DELETE',
    //     schema: 'public',
    //     table: 'notifications',
    //     filter: `user_id=eq.${user.id}`,
    //   }, (payload) => {
    //     const deletedId = payload.old.id;
    //     setNotifications(prev => prev.filter(n => n.id !== deletedId));
    //   })
    //   .subscribe();
    // return () => { supabase.removeChannel(channel); };
  }, [user]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refetch: fetchNotifications,
  };
}
