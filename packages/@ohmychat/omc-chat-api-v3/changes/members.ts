import { supabase } from "@ohmychat/ohmychat-backend-core";
import { eventEmitter } from "../events/emitter";

/**
 * Gère les changements sur la table `chat_group_members` et notifie les membres du groupe.
 *
 * @async
 * @param {Object} payload - Données de l'événement Supabase (inclut l'état `new` du membre).
 * @returns {Promise<void>}
 *
 * Pour chaque membre du groupe, émet :
 * - un événement `incoming_<userId>` avec le type 'user' et le profil du membre ajouté/modifié,
 * - un événement `incoming_<userId>` avec le type 'member' et les nouvelles données du membre.
 */
export const membersChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(*)))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.group) return;

        data.group.members.forEach(({ user: { id } }) => {
            const { user: profile } = data.group.members.find(m => m.user.id === payload.new.user);
            eventEmitter.emit(`incoming_${id}`, 'user', profile);
            eventEmitter.emit(`incoming_${id}`, 'member', payload.new);
        });
    }
}