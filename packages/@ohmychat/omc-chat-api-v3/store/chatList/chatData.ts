import { Member, Message, UserChatData } from "../../types";

/**
 * Récupère et structure les données de chat pour un utilisateur donné à partir du store global.
 *
 * @param {Object} store - Store global contenant les observables des groupes, membres, messages, utilisateurs et statuts de saisie.
 * @param {string} userId - L'identifiant de l'utilisateur.
 * @returns {UserChatData} Objet contenant les groupes, membres, utilisateurs, messages, statuts de saisie et messages groupés par groupe.
 */
export function getChatData(store, userId): UserChatData {
    const {
        groupsByUsers$, sourcesByGroup$, messagesByGroup$, typingByGroups$, users$
    } = store;

    const groups = groupsByUsers$.get()[userId];
    if (!groups) return null;
    
    const members = groups?.flatMap(g => sourcesByGroup$.get()[g?.id]);
    const users = members?.flatMap(i => users$.get()[i?.user]).reduce((acc, user) => {
        acc[user?.id] = user;
        return acc;
    }, {});

    const messages = groups?.flatMap(g => messagesByGroup$.get()[g?.id]).filter(m => m?.status !== null);
    const typing = groups?.flatMap(g => typingByGroups$.get()[g?.id]).filter(t => t?.status !== null);

    const membersById = Object.groupBy(members, (m: Member) => m?.id);
    const messagesByGroup = Object.groupBy(messages, (m: Message) => membersById[m?.source]?.[0]?.group);

    return { groups, members, users, messages, typing, messagesByGroup };
}