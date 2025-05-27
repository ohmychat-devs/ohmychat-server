import { verifyToken } from "@ohmychat/ohmychat-auth-api";

/**
 * Gère la souscription d'un client à une conversation spécifique via WebSocket.
 *
 * @param {Socket} socket - Instance du socket client.
 * @param {Map} subscriptions - Map des souscriptions actives par chatID.
 * @param {Object} store - Store contenant conversation$ (observable).
 *
 * - À la connexion ("conversation_join"), vérifie le token, souscrit aux changements de la conversation
 *   et envoie les mises à jour en temps réel.
 * - À la déconnexion ("conversation_leave"), nettoie la souscription et quitte la room de la conversation.
 */
export const handleChatBox = (socket, subscriptions, store) => {
    const { chatBox$ } = store;

    socket.on("conversation_join", async (token, chatID) => {
        const userId = await verifyToken(token);
        if (!userId) return socket.disconnect(true);

        console.log(`socket ${socket.id} joined conversation ${chatID}`);

        const sub = chatBox$(chatID).onChange(({ value }) => {
            socket.emit("conversation-data", value ?? []);
        }, { immediate: true, initial: true });
      
        socket.join(chatID);
      
        subscriptions.set(chatID, () => {
            sub();
        });
    });

    socket.on("conversation_leave", async (token, chatID) => {
        const userId = await verifyToken(token);
        if (!userId) return socket.disconnect(true);
        
        console.log(`socket ${socket.id} left conversation ${chatID}`);
    
        const cleanup = subscriptions.get(chatID);
        if (cleanup) {
            cleanup();
            subscriptions.delete(chatID);
        }
    });
}