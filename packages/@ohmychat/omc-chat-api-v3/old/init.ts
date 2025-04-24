import { supabase } from "@ohmychat/ohmychat-backend-core";
import { Group, Member, User, Typing, Message, FetchedChat } from "../types";

export const init: Function = async function(id: string): Promise<FetchedChat> {
    console.log('Initializing chat...');

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
        .eq('user', id);

    const $ = {
        groups: new Map<string, Group>(),
        members: new Map<string, Member>(),
        users: new Map<string, User>(),
        typing: new Map<string, Typing>(),
        messages: new Map<string, Message>(),
    }

    if (error || !data)  console.log(error || 'No data found');
    else data?.forEach(({ group }) => {
        if (!group) return;

        const { members: membersData = [], ...groupData } = group;
        $.groups.set(group.id, groupData);
        
        membersData?.forEach(member => {
            const { typing: typingData, messages: messagesData, userData, ...memberData } = member;
            $.members.set(member.id, memberData);
            if (typingData) $.typing.set(member.id, typingData);
            if (userData) $.users.set(userData.id, userData);
            for (const message of messagesData) $.messages.set(message.id, message);
        });
    });
    
    return {
        groups: Array.from($.groups.values()),
        members: Array.from($.members.values()),
        typing: Array.from($.typing.values()),
        messages: Array.from($.messages.values()),
        users: Array.from($.users.values())
    } as FetchedChat;
}