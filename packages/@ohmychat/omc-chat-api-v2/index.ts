import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import fetchChat from "./api/fetchChat";

const namespaceAuth = '/chat';

const messagesChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_messages')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;;

        data.source.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/message', payload.new));
    }
}

const typingChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_typing')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('source', payload.new.source)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;;

        data.source.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/typing', payload.new));
    }
}

const membersChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.group) return;

        console.log(payload.new);

        data.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/member', payload.new));
    }
}

const groupChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_groups')
        .select(`members:chat_group_members(user(id))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.members) return;

        data.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/group', payload.new));
    }
}

const userChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('user', payload.new.id)

    if (error) {
        console.log(error);
    } else {
        data.map(g => g.group.members).flat().forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/user', payload.new));
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
    .subscribe()

io.of(namespaceAuth).on('connection', async function(socket) {
    let currentToken;
    
    socket.on('chat_init', async function(token, callback) {
        console.log(socket.id, token);
        if (currentToken) socket.leave('user/' + currentToken);

        currentToken = token;
        socket.join('user/' + token);

        callback(await fetchChat(token))
    });

    socket.on('set/typing', function(status, channelSrcID) {
        console.log('set/typing', status, channelSrcID);
        supabase
            .from('chat_group_typing')
            .upsert({
                source: channelSrcID,
                status,
                date: new Date().toISOString(),
            }, { onConflict: 'source' })
            .then(({ data, error }) => {
                if (error) {
                    console.log(error);
                }
            });
    });

    socket.on('set/seen', function() {});

    socket.on('set/message', function(channelSrcID, { text, parentID, messageID }) {
        supabase
            .from('chat_group_messages')
            .upsert({
                source: channelSrcID,
                text,
                parent: parentID,
                id: messageID
            }, { onConflict: 'id' })
            .then(({ data, error }) => {
                if (error) {
                    console.log(error);
                }
            })
        console.log('set/message', text, channelSrcID, parentID, messageID);
    });
        
    socket.on('disconnect', function() {
        socket.leave('user/' + currentToken);
        socket.disconnect();
        socket.removeAllListeners();
    });
});