import { events, supabase } from "@ohmychat/ohmychat-backend-core";

export const messagesChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_messages')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;
        data.source.group.members.forEach(({ user : { id } }) => events.emit(id, 'message', payload.new)) ;
    }
};

export const typingChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_typing')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('source', payload.new.source)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;
        data.source.group.members.forEach(({ user: { id } }) =>
            events.emit(id, 'typing', payload.new)
        );
    }
}

export const membersChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(*)))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.group) return;

        data.group.members.forEach(({ user: { id } }) => {
            const { user: profile } = data.group.members.find(m => m.user.id === payload.new.user);
            events.emit(id, 'user', profile);
            events.emit(id, 'member', payload.new);
        });
    }
}

export const groupChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_groups')
        .select(`members:chat_group_members(user(id))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.members) return;
        data.members.forEach(({ user: { id } }) => events.emit(id, 'group', payload.new));
    }
}

export const userChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('user', payload.new.id)

    if (error) {
        console.log(error);
    } else {
        data.map(g => g.group.members).flat().forEach(({ user : { id } }) => events.emit(id, 'user', payload.new));
    }
}

supabase.channel('ohmychat-realtime-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_typing' }, typingChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_typing' }, typingChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_groups' }, groupChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_groups' }, groupChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, userChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, userChanges)
    .subscribe();