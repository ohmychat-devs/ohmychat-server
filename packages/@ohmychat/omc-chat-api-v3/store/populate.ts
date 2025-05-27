import { supabase } from "@ohmychat/ohmychat-backend-core";

function mergeById<T extends { id: string | number }>(
    prev: T[],
    incomingMap: Map<string | number, T>
  ): T[] {
    const map = new Map(prev.map(item => [item.id, item]));
  
    for (const [id, item] of incomingMap) {
      map.set(id, item);
    }
  
    return Array.from(map.values());
}

export const populateStore = async ({members$, groups$, typing$, messages$, users$}, id) => {
    const membersMap = new Map();
    const groupsMap = new Map();
    const typingMap = new Map();
    const messagesMap = new Map();
    const usersMap = new Map();

    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(
            *, members:chat_group_members!inner(
                *,
                userData:users!inner(*),
                typing:chat_group_typing(*),
                messages:chat_group_messages!chat_group_messages_source_fkey(*)
            )
        )`)
        .eq('user', id)
        .order('created_at', { ascending: true });

    if (error || !data) {
        console.error('Supabase fetch error:', error || 'No data found');
        throw error || new Error('No data found');
    }

    data.forEach(({ group }: any) => {
        if (!group) return;

        const { members: memberList = [], ...groupInfo }: any = group;
        groupsMap.set(group?.id, groupInfo);
        
        memberList.forEach(member => {
            const { typing: typingInfo, messages: messageList, userData, ...memberInfo } = member;
            membersMap.set(member.id, memberInfo);
            if (typingInfo) typingMap.set(member.id, typingInfo);
            if (userData) usersMap.set(userData.id, userData);
            for (const message of messageList) messagesMap.set(message.id, message);
        });
    });
    
    // Merge maps into observables
    members$.set(prev => mergeById(prev, membersMap));
    groups$.set(prev => mergeById(prev, groupsMap));
    typing$.set(prev => mergeById(prev, typingMap));
    messages$.set(prev => mergeById(prev, messagesMap));
    users$.set(prev => ({ ...prev, ...Object.fromEntries(usersMap) }));
}