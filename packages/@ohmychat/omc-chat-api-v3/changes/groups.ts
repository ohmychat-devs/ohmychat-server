import { supabase } from "@ohmychat/ohmychat-backend-core";
import { eventEmitter } from "../events/emitter";

/**
 * Gère les changements sur la table `chat_groups` et notifie les membres concernés.
 *
 * @async
 * @param {Object} payload - Données de l'événement Supabase (inclut l'état `new` du groupe).
 * @returns {Promise<void>}
 *
 * Pour chaque membre du groupe, émet un événement `incoming_<userId>` avec le type 'group' et les nouvelles données du groupe.
 */
export const groupChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_groups')
        .select(`members:chat_group_members(user(id))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.members) return;
        data.members.forEach(({ user: { id } }) => eventEmitter.emit(`incoming_${id}`, 'group', payload.new));
    }
}