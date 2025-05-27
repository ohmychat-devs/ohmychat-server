import { observable } from "@legendapp/state";
import { populateStore } from "./populate";
import { syncStore } from "./sync";
import { createObservables } from "./store";
import { createChatList$ } from "./chatList";
import { eventEmitter } from "../events/emitter";
import { msgsSorter } from "../functions/msgsSorter";

/**
 * Crée un magasin de chat avec des observables pour les messages, les groupes, les membres, les utilisateurs et les saisies.
 * @returns {Object} Un objet avec des fonctions pour initialiser le magasin, obtenir la liste des chats et obtenir une conversation.
 */
export const createStore = function () {
    const store = createObservables();

    /**
     * Initialise le magasin en le remplissant avec des données provenant du serveur.
     * @param {string} id L'ID de l'utilisateur.
     * @returns {Function} Une fonction pour arr ter la synchronisation du magasin.
     */
    const init = async (id) => {
        await populateStore(store, id);
        const handler = await syncStore(store, id);

        eventEmitter.on('incoming_'+id, handler);
        return () => {
            eventEmitter.off('incoming_'+id, handler);
        }
    };
    
    /**
     * Retourne un observable qui  mit la liste des chats pour l'ID utilisateur donné.
     * @param {string} userId L'ID de l'utilisateur.
     * @returns {Observable} Un observable qui  mit la liste des chats.
     */
    const chatList$ = (userId) => createChatList$(store, userId);

    /**
     * Retourne un observable qui  mit la conversation pour l'ID de groupe donné.
     * @param {string} id L'ID de groupe.
     * @returns {Observable} Un observable qui  mit la conversation.
     */
    const chatBox$ = (id) => observable(() => {
        const messages = store.messagesByGroup$.get()[id];
        return messages?.sort(msgsSorter).filter(m => m.status !== null).map(m => {
            let source = store.sourcesByID$.get()[m.source]?.user;
            source = store.users$.get()[source];
            return { ...m, source };
        });
    });

    return {
        chatList$,
        chatBox$,
        init,
        ...store
    };
}