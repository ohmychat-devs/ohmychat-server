import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import fetchChat from "./api/fetchChat";
import namespaceAuth from "./namespace";
import messagesChanges from "./functions/messagesChanges";
import membersChanges from "./functions/membersChanges";
import typingChanges from "./functions/typingChanges";
import groupChanges from "./functions/groupChanges";
import userChanges from "./functions/userChanges";
import setTyping from "./functions/setTyping";
import setMessage from "./functions/setMessage";

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

    socket.on('set/typing', setTyping);

    socket.on('set/seen', function() {});

    socket.on('set/message', setMessage);
        
    socket.on('disconnect', function() {
        socket.leave('user/' + currentToken);
        socket.disconnect();
        socket.removeAllListeners();
    });
});