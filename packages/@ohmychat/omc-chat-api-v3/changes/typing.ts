import { supabase } from "@ohmychat/ohmychat-backend-core";
import { eventEmitter } from "../events/emitter";

/**
 * Gère les changements sur la table `chat_group_typing` et notifie les membres du groupe.
 *
 * @async
 * @param {Object} payload - Données de l'événement Supabase (inclut l'état `new` du statut de saisie).
 * @returns {Promise<void>}
 *
 * Pour chaque membre du groupe, émet un événement `incoming_<userId>` avec le type 'typing' et les nouvelles données du statut de saisie.
 */
export const typingChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_typing')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('source', payload.new.source)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;
        data.source.group.members.forEach(({ user: { id } }) =>
            eventEmitter.emit(`incoming_${id}`, 'typing', payload.new)
        );
    }
}