import { observe } from "@legendapp/state";
import { generateChatFeed } from "./generateFeed";

export function chatEvents(ctxt: any) {
    const { socket, store } = ctxt;

    observe(store.currentToken, ({ value: token }) => {
        if (!token) return;
        console.log("token", token);
    });

    socket.on("chat.list", () => {
        const token = store.currentToken.get();
        const loaded = store.chat?.loaded?.[token]?.get();
        if(!loaded) generateChatFeed({ token, store });

        observe(store.chat.chatList$, ({ value: chatList }) => {
            socket.emit("chat.list", chatList);
        });
    });
}