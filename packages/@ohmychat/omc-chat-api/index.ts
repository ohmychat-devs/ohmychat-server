import { io, supabase } from "../omc-backend-core";
import getUserChat from "./handlers/getUserChat";
import { messagesChanges, membersChanges, groupsChanges } from "./handlers/changes";
import { namespace } from "./namespace";

supabase.channel('ohmychat-realtime-messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_messages' }, messagesChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_group_members' }, membersChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_groups' }, groupsChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'chat_groups' }, groupsChanges)
    .subscribe()

io.of(namespace).on('connection', function(socket) {
    socket.on('chat/get', getUserChat);
    console.log('hello');
});