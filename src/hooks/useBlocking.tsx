import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface BlockedUser {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

// Mock blocked users storage
let mockBlockedUsersStore: BlockedUser[] = [];

export function useBlocking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBlockedUsers();
    } else {
      setBlockedUsers([]);
      setLoading(false);
    }
  }, [user]);

  const fetchBlockedUsers = async () => {
    if (!user) return;

    // Mock data - filter by user
    const userBlocks = mockBlockedUsersStore.filter(
      b => b.blocker_id === user.id || b.blocked_id === user.id
    );
    setBlockedUsers(userBlocks);
    setLoading(false);
  };

  const blockUser = async (blockedId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Mock block
    const newBlock: BlockedUser = {
      id: `block-${Date.now()}`,
      blocker_id: user.id,
      blocked_id: blockedId,
      created_at: new Date().toISOString(),
    };
    
    mockBlockedUsersStore.push(newBlock);
    setBlockedUsers(prev => [...prev, newBlock]);
    
    toast({
      title: 'User blocked',
      description: 'You will no longer receive messages from this user',
    });
    
    console.log('Mock user blocked:', newBlock);
    return { error: null };
  };

  const unblockUser = async (blockedId: string) => {
    if (!user) return { error: new Error('Not authenticated') };

    // Mock unblock
    mockBlockedUsersStore = mockBlockedUsersStore.filter(
      block => !(block.blocker_id === user.id && block.blocked_id === blockedId)
    );
    setBlockedUsers(prev => 
      prev.filter(block => !(block.blocker_id === user.id && block.blocked_id === blockedId))
    );
    
    toast({
      title: 'User unblocked',
      description: 'You can now exchange messages with this user',
    });
    
    console.log('Mock user unblocked:', blockedId);
    return { error: null };
  };

  const isBlocked = (otherUserId: string): boolean => {
    if (!user) return false;
    return blockedUsers.some(
      (block) =>
        (block.blocker_id === user.id && block.blocked_id === otherUserId) ||
        (block.blocker_id === otherUserId && block.blocked_id === user.id)
    );
  };

  const didIBlock = (otherUserId: string): boolean => {
    if (!user) return false;
    return blockedUsers.some(
      (block) => block.blocker_id === user.id && block.blocked_id === otherUserId
    );
  };

  return {
    blockedUsers,
    loading,
    blockUser,
    unblockUser,
    isBlocked,
    didIBlock,
    refetch: fetchBlockedUsers,
  };
}
