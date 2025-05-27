import { Observable } from "@legendapp/state";
import { idFromToken } from "../auth";
import { Store } from "../types";

export function chatList (store: Observable<Store>) {
    return () => {
        const token = store.currentToken?.get();
        if (!token) return null;
    
        const userId = idFromToken(token);
        const members = store.chat.members$?.get() ?? [];
        const groups = store.chat.groups$?.get() ?? [];
        const users = store.users$?.get() ?? {};
        const messages = store.chat.messages$?.get() ?? [];
        const typing = store.chat.typing$?.get() ?? [];
    
        const myGroupIds = members
            .filter(member => member.user === userId)
            .filter(member => member.status === 'active')
            .map(member => member.group);
    
        const chatList = myGroupIds.map(groupId => {
            const group = groups.find(g => g.id === groupId);
            const groupMembers = members.filter(m => m.group === groupId).filter(m => m.status === 'active');
            const groupProfiles = groupMembers.map(m => users[m.user]).filter(p => p?.id !== userId);
    
            const groupMessages = messages.filter(msg => {
                const msgMember = members.filter(m => m.status === 'active').find(m => m.id === msg.source);
                return msgMember?.group === groupId;
            });
    
            const groupTyping = typing.filter(t => {
                const msgMember = members.filter(m => m.status === 'active').find(m => m.id === t.source);
                return msgMember?.group === groupId;
            });
    
            const myMembership = groupMembers.find(m => m.user === userId);
            const { last_msg_seen, id: myMembershipId } = myMembership ?? {};
    
            const title = getTitle(group, groupProfiles);
            const unread = getUnread(groupMessages, last_msg_seen, myMembershipId);
            const lastActivity = getLastActivity(groupMessages, groupTyping, groupMembers, groupProfiles, group, title);
    
            return { title, lastActivity, unread };
        });
    
        return chatList.sort((a, b) => b?.lastActivity?.date - a?.lastActivity?.date);
    }
}

const getTitle = (group: any, profiles: any) => {
    if(group?.name) return { displayname : group.name };
    else if(profiles?.length === 1 ) return { displayname : profiles[0]?.displayname, username : profiles[0]?.username };
    else if(profiles?.length > 1 ) return { displayname : profiles.map(p => p?.displayname).join(", ") };
    else return { displayname : "" };
}

const getUnread = (messages: any[], last_msg_seen: any, idSourceUser: any) => {
    messages = messages?.sort((a, b) => new Date(a?.created_at).getTime() - new Date(b?.created_at).getTime());
    const lastSeenIndex = messages?.findIndex(m => m.id === last_msg_seen);
    if (!idSourceUser || !last_msg_seen || !lastSeenIndex || lastSeenIndex === -1) return messages?.filter(m => m.source !== idSourceUser)?.length;
    return messages?.slice(lastSeenIndex + 1)?.filter(m => m.source !== idSourceUser);
}

const getLastActivity = (messages: any[], typing: any[], members: any[], profiles: any[], group: any, title: any) => {
    const typingAudio = typing.filter(t => t?.status === 'audio');
    const typingText = typing.filter(t => t?.status === 'text');

    const getProfileFromSource = (source: string) => {
        const profileID = members.find(m => m?.id === source)?.user;
        return profiles.find(p => p?.id === profileID);
    }

    // Typing vocal
    if (typingAudio.length > 0) {
        const namesText = typingAudio.map(t => getProfileFromSource(t?.source)?.displayname).join(", ");
        return {
            key: 'chat.typing_audio_dynamic',
            params: { names: namesText },
            date: Math.max(...typingAudio.map(t => new Date(t?.date).getTime()))
        };
    }

    // Typing texte
    if (typingText.length > 0) {
        const namesText = typingText.map(t => getProfileFromSource(t?.source)?.displayname).join(", ");
        return {
            key: 'chat.typing_text_dynamic',
            params: { names: namesText },
            date: Math.max(...typingText.map(t => new Date(t?.date).getTime()))
        };
    }

    if (messages?.length === 0) {
        return {
            key: 'chat.welcome_message',
            params: { name: title?.displayname },
            date: new Date(group?.created_at).getTime()
        };
    }

    const lastMessage = messages[messages.length - 1];
    const profile = getProfileFromSource(lastMessage?.source);

    if (lastMessage?.text) {
        return {
            key: 'chat.last_message_text',
            params: {
                name: profile?.displayname,
                message: lastMessage.text
            },
            date: new Date(lastMessage?.created_at).getTime()
        };
    }

    return {
        key: 'chat.last_message_generic',
        params: { name: profile?.displayname },
        date: new Date(lastMessage?.created_at).getTime()
    };
}