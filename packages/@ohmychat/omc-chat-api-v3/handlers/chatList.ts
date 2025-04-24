import { verifyToken } from "@ohmychat/ohmychat-auth-api";

/**
 * Gère la souscription d'un client à la liste de ses chats via WebSocket.
 *
 * @param {Socket} socket - Instance du socket client.
 * @param {Map} subscriptions - Map des souscriptions actives par userId.
 * @param {Object} store - Store contenant chatList$ (observable) et init (fonction d'initialisation).
 *
 * - À la connexion ("chatList_join"), vérifie le token, initialise le store pour l'utilisateur,
 *   souscrit aux changements de la liste de chats et envoie les mises à jour en temps réel.
 * - À la déconnexion ("chatList_leave"), nettoie la souscription et quitte la room utilisateur.
 */
export const handleChatList = (socket, subscriptions, store) => {
    const { chatList$, init } = store;

    socket.on("chatList_join", async (token) => {
        const userId = await verifyToken(token);
        if (!userId) return socket.disconnect(true);

        console.log(`socket ${socket.id} joined chat for user ${userId}`);

        const unsubscribe = await init(userId);
        const sub = chatList$(userId).onChange(({ value }) => {
            socket.emit("chatList", value);
        }, { immediate: true, initial: true });

        socket.join(userId);

        subscriptions.set(userId, () => {
            sub();
            unsubscribe();
        });

        socket.on("chatList_leave", (userId) => {
            console.log(`socket ${socket.id} left chat for user ${userId}`);
            socket.leave(userId);
        
            const cleanup = subscriptions.get(userId);
            if (cleanup) {
                cleanup();
                subscriptions.delete(userId);
            }
        });
    });
};