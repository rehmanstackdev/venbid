export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderType: "customer" | "vendor";
  content: string;
  createdAt: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  customerId: string;
  customerName: string;
  vendorId: string;
  vendorName: string;
  vendorCategory: string;
  lastMessage: string;
  lastMessageAt: Date;
  unreadCount: number;
}

// Current user mock - in real app this comes from auth
export const currentUser = {
  id: "current-user",
  name: "John D.",
  type: "customer" as const,
};

export const mockConversations: Conversation[] = [
  {
    id: "conv-1",
    listingId: "1",
    listingTitle: "Need plumber to fix leaking kitchen sink ASAP",
    listingImage: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=400&h=300&fit=crop",
    customerId: "current-user",
    customerName: "John D.",
    vendorId: "vendor-1",
    vendorName: "Mike's Plumbing",
    vendorCategory: "Plumbing Services",
    lastMessage: "I can come by tomorrow morning around 9am. Does that work for you?",
    lastMessageAt: new Date(Date.now() - 15 * 60 * 1000),
    unreadCount: 2,
  },
  {
    id: "conv-2",
    listingId: "4",
    listingTitle: "Deep cleaning needed for 3-bedroom apartment",
    listingImage: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    customerId: "current-user",
    customerName: "John D.",
    vendorId: "vendor-2",
    vendorName: "Sparkle Clean Co.",
    vendorCategory: "Home Cleaning",
    lastMessage: "Great! I'll bring all supplies. See you Saturday at 10am.",
    lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    unreadCount: 0,
  },
  {
    id: "conv-3",
    listingId: "5",
    listingTitle: "Fix squeaky door hinges and install new doorknob",
    listingImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    customerId: "current-user",
    customerName: "John D.",
    vendorId: "vendor-3",
    vendorName: "Handy Dan",
    vendorCategory: "Handyman & Small Repairs",
    lastMessage: "Thanks for reaching out! What brand is the doorknob you purchased?",
    lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    unreadCount: 1,
  },
];

export const mockMessages: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1",
      conversationId: "conv-1",
      senderId: "vendor-1",
      senderName: "Mike's Plumbing",
      senderType: "vendor",
      content: "Hi! I saw your posting about the leaking kitchen sink. I have 15 years of experience with plumbing repairs and I'm available this week.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-2",
      conversationId: "conv-1",
      senderId: "current-user",
      senderName: "John D.",
      senderType: "customer",
      content: "Thanks for reaching out! The leak is coming from under the sink, I think it might be the pipe connection. When are you available to take a look?",
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-3",
      conversationId: "conv-1",
      senderId: "vendor-1",
      senderName: "Mike's Plumbing",
      senderType: "vendor",
      content: "That sounds like it could be a loose fitting or worn gasket. Usually a quick fix. I have an opening tomorrow morning or Thursday afternoon.",
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-4",
      conversationId: "conv-1",
      senderId: "current-user",
      senderName: "John D.",
      senderType: "customer",
      content: "Tomorrow morning works great for me!",
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-5",
      conversationId: "conv-1",
      senderId: "vendor-1",
      senderName: "Mike's Plumbing",
      senderType: "vendor",
      content: "I can come by tomorrow morning around 9am. Does that work for you?",
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
    },
  ],
  "conv-2": [
    {
      id: "msg-6",
      conversationId: "conv-2",
      senderId: "vendor-2",
      senderName: "Sparkle Clean Co.",
      senderType: "vendor",
      content: "Hello! I'm interested in your deep cleaning job. I run a small team and we specialize in move-out cleanings. We can do your 3-bedroom apartment.",
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-7",
      conversationId: "conv-2",
      senderId: "current-user",
      senderName: "John D.",
      senderType: "customer",
      content: "That sounds perfect! How much would you charge and when are you available?",
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-8",
      conversationId: "conv-2",
      senderId: "vendor-2",
      senderName: "Sparkle Clean Co.",
      senderType: "vendor",
      content: "For a 3-bed 2-bath apartment with deep cleaning, I'd charge $275. That includes all supplies. I'm available this Saturday at 10am.",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-9",
      conversationId: "conv-2",
      senderId: "current-user",
      senderName: "John D.",
      senderType: "customer",
      content: "That works for me. Saturday at 10am is confirmed!",
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-10",
      conversationId: "conv-2",
      senderId: "vendor-2",
      senderName: "Sparkle Clean Co.",
      senderType: "vendor",
      content: "Great! I'll bring all supplies. See you Saturday at 10am.",
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
  ],
  "conv-3": [
    {
      id: "msg-11",
      conversationId: "conv-3",
      senderId: "vendor-3",
      senderName: "Handy Dan",
      senderType: "vendor",
      content: "Hey there! I can help with those squeaky hinges and doorknob. I've done hundreds of these jobs. Usually takes about an hour.",
      createdAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-12",
      conversationId: "conv-3",
      senderId: "current-user",
      senderName: "John D.",
      senderType: "customer",
      content: "Great! I already bought the new doorknob from Home Depot. Do you need anything else from me?",
      createdAt: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "msg-13",
      conversationId: "conv-3",
      senderId: "vendor-3",
      senderName: "Handy Dan",
      senderType: "vendor",
      content: "Thanks for reaching out! What brand is the doorknob you purchased?",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      read: false,
    },
  ],
};

export function formatMessageTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.floor(diffMs / (1000 * 60));
    return diffMins < 1 ? "Just now" : `${diffMins}m ago`;
  }
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatChatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", { 
    hour: "numeric", 
    minute: "2-digit",
    hour12: true 
  });
}
