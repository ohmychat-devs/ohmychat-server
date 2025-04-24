import { Member, Message } from '../types';

export const getUnreadMessagesCount = function ({ members, messages, id: channelId }: { members: Member[], messages: Message[], id: string }, userId: string): number {
    const userSource = members?.find(m => m.group === channelId && m.user === userId);
    const userMessages = messages?.filter(m => members.find(s => s.id === m.source)?.group === channelId && m.status !== null);

    if (!userSource || !userSource.last_msg_seen) {
      // Aucun message vu → tous les messages sont non-lus
      return userMessages?.filter((m: any) => m.source !== userSource?.id)?.length;
    }
  
    const lastSeenIndex = userMessages.findIndex((m: any) => m.id === userSource.last_msg_seen);
    
    if (lastSeenIndex === -1) {
      // Message vu non trouvé (corrompu ou supprimé ?) → tous les messages sont non-lus
      return userMessages?.filter((m: any) => m.source !== userSource?.id)?.length;
    }
  
    // Tous les messages après celui vu
    let unreadMessages = userMessages.slice(lastSeenIndex + 1);

    unreadMessages.forEach((m: any) => {
        console.log(m.source, userSource?.id);
    });

    unreadMessages = unreadMessages.filter((m: any) => m.source !== userSource?.id)
    return unreadMessages.length;
}