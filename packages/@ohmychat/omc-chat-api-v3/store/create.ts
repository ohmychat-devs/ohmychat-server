import { observable } from "@legendapp/state";
import { populateStore } from "../functions/populateStore";
import { syncStore } from "../functions/syncStore";
import { createObservables } from "./store";
import { createChatList$ } from "./chatList";

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
        const { off } = await syncStore(store, id);
        return off;
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
    const conversation$ = (id) => observable(() => store.messagesByGroup$.get()[id]);

    return {
        chatList$,
        conversation$,
        init
    };
}