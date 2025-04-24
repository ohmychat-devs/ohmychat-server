import { supabase } from "@ohmychat/ohmychat-backend-core";
import { eventEmitter } from "../events/emitter";

/**
 * Gère les changements sur la table `users` et notifie tous les membres des groupes auxquels appartient l'utilisateur.
 *
 * @async
 * @param {Object} payload - Données de l'événement Supabase (inclut l'état `new` de l'utilisateur).
 * @returns {Promise<void>}
 *
 * Pour chaque membre des groupes de l'utilisateur, émet un événement `incoming_<userId>` avec le type 'user' et les nouvelles données de l'utilisateur.
 */
export const userChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('user', payload.new.id)

    if (error) {
        console.log(error);
    } else {
        data.map(g => g.group.members).flat().forEach(({ user : { id } }) => eventEmitter.emit(`incoming_${id}`, 'user', payload.new));
    }
}