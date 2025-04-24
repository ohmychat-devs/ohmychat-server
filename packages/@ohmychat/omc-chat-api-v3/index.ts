import { createStore } from "./store/create";
import { io } from "@ohmychat/ohmychat-backend-core";

import './supabase/realtime';
import './test/client';

import { handleChatList } from "./handlers/chatList";
import { handleConversation } from "./handlers/conversation";

io.on("connection", async socket => {
    console.log("a user connected", socket.id);
    const store = createStore();
    const subscriptions = new Map();

    handleChatList(socket, subscriptions, store);
    handleConversation(socket, subscriptions, store);

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
    
        for (const [userId, cleanup] of subscriptions.entries()) {
            cleanup();
            socket.leave(userId);
        }
    
        subscriptions.clear();
    });
});