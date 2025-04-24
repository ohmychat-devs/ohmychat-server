import { observable } from "@legendapp/state";
import { ChatStoreObservables, Group, Member, Message, Typing, User } from "../types";

/**
 * Crée les observables pour le store de l'application.
 *
 * Les observables créés sont :
 * - `members$`: La liste des membres du chat.
 * - `groups$`: La liste des groupes du chat.
 * - `typing$`: La liste des utilisateurs qui sont en train d'écrire un message.
 * - `messages$`: La liste des messages du chat.
 * - `users$`: La liste des utilisateurs du chat.
 *
 * Les observables dérivés créés sont :
 * - `sourcesByUser$`: Une carte qui mappe chaque utilisateur à la liste de ses sources.
 * - `sourcesByGroup$`: Une carte qui mappe chaque groupe à la liste de ses sources.
 * - `sourcesByID$`: Une carte qui mappe chaque ID de source à la source correspondante.
 * - `groupsByID$`: Une carte qui mappe chaque ID de groupe à le groupe correspondant.
 * - `groupsByUsers$`: Une carte qui mappe chaque utilisateur à la liste de ses groupes.
 * - `typingByGroups$`: Une carte qui mappe chaque groupe à la liste des utilisateurs qui sont en train d'écrire un message dans ce groupe.
 * - `messagesByGroup$`: Une carte qui mappe chaque groupe à la liste de ses messages.
 *
 * @returns Les observables créés.
 */
export const createObservables = function (): ChatStoreObservables {
    const members$ = observable<Member[]>([]);
    const groups$ = observable<Group[]>([]);
    const typing$ = observable<Typing[]>([]);
    const messages$ = observable<Message[]>([]);
    const users$ = observable<User[]>([]);

    const sourcesByUser$ = observable(() => Object.groupBy(members$.get(), m => m.user));
    const sourcesByGroup$ = observable(() => Object.groupBy(members$.get(), m => m.group));
    const sourcesByID$ = observable(() => members$.get().reduce((acc, member) => {
        acc[member.id] = member;
        return acc;
    }, {}));
    
    const groupsByID$ = observable(() => groups$.get().reduce((acc, group) => {
        acc[group.id] = group;
        return acc;
    }, {}));
    
    const groupsByUsers$ = observable(() => Object.entries(sourcesByUser$.get()).reduce((acc, [user, source]) => {
        acc[user] = source
            .filter(m => m?.status !== null)
            .map(m => groupsByID$.get()[m.group])
            .filter(g => g?.status !== null);
        return acc;
    }, {}));
    
    const typingByGroups$ = observable(() => Object.groupBy(typing$.get(), t => sourcesByID$.get()[t.source]?.group));

    const messagesByGroup$ = observable(() => Object.groupBy(messages$.get(), m => members$.get().find(member => member.id === m?.source)?.group));

    return { members$, groups$, typing$, messages$, users$, sourcesByUser$, sourcesByGroup$, sourcesByID$, groupsByID$, groupsByUsers$, typingByGroups$, messagesByGroup$ };
}
