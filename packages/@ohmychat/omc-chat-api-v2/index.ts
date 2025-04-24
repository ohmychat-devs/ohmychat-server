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
import setseen from "./functions/setSeen";
import jwt from "jsonwebtoken";

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

    socket.on('hello', function(data, callback) {
        callback(data);
    });
    
    socket.on('chat_init', async function(tokens, callback) {
        try {
            callback(await (Array.isArray(tokens) ? tokens : [tokens]).reduce(async (accP, token) => {
                const acc = await accP;
            
                console.log('token', token);
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const id = decoded?.id;
            
                if (!id) return acc;
            
                socket.join('user/' + id);
                const chat = await fetchChat(id);
            
                return { ...acc, [id]: chat };
            }, Promise.resolve({})));
        } catch (error) {
            console.error(error);
        }
    });

    socket.on('set/typing', setTyping);

    socket.on('set/seen', setseen);

    socket.on('set/message', setMessage);
        
    socket.on('disconnect', function() {
        socket.leave('user/' + currentToken);
        socket.disconnect();
        socket.removeAllListeners();
    });
});