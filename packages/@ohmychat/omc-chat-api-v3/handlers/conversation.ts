import { verifyToken } from "@ohmychat/ohmychat-auth-api";

/**
 * Gère la souscription d'un client à une conversation spécifique via WebSocket.
 *
 * @param {Socket} socket - Instance du socket client.
 * @param {Map} subscriptions - Map des souscriptions actives par conversationId.
 * @param {Object} store - Store contenant conversation$ (observable).
 *
 * - À la connexion ("conversation_join"), vérifie le token, souscrit aux changements de la conversation
 *   et envoie les mises à jour en temps réel.
 * - À la déconnexion ("conversation_leave"), nettoie la souscription et quitte la room de la conversation.
 */
export const handleConversation = (socket, subscriptions, store) => {
    const { conversation$ } = store;

    socket.on("conversation_join", async (token, conversationId) => {
        const userId = await verifyToken(token);
        if (!userId) return socket.disconnect(true);

        console.log(`socket ${socket.id} joined conversation ${conversationId}`);

        const sub = conversation$(conversationId).onChange(({ value }) => {
            socket.emit("conversation-data", value ?? []);
        }, { immediate: true, initial: true });
      
        socket.join(conversationId);
      
        subscriptions.set(conversationId, () => {
            sub();
        });
      
        socket.on("conversation_leave", (id) => {
            if (id !== conversationId) return;
            
            console.log(`socket ${socket.id} left conversation ${id}`);
            socket.leave(id);
        
            const cleanup = subscriptions.get(id);
            if (cleanup) {
                cleanup();
                subscriptions.delete(id);
            }
        });
    });
}