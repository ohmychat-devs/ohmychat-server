import { observable } from "@legendapp/state";
import { formatChat } from "./formatChat";
import { getChatData } from "./chatData";
import { ChatStoreObservables } from "../../types";

/**
 * Crée un observable représentant la liste des chats formatés pour un utilisateur donné.
 *
 * @param {ChatStoreObservables} store - Le store global contenant les données des chats.
 * @param {string} user - L'identifiant de l'utilisateur.
 * @returns {Observable} Observable de la liste des chats formatés pour l'utilisateur.
 */
export const createChatList$ = (store: ChatStoreObservables, user: string) => {
    return observable(() => {
        const data = getChatData(store, user);
        if (!data) return [];

        const { groups } = data;

        return groups.map(chat => formatChat(chat, user, data));
    });
};
