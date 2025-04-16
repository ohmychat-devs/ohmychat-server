import { io, supabase } from "../../../omc-backend-core";
import { namespace } from "../../namespace";

const groupsChanges = (payload) => {
    console.log(payload);
    supabase
    .from('chat_groups')
    .select(`
        *,
        created_by(*),
        members:chat_group_members(
            id,
            user(*),
            group(*),
            last_msg_seen(*)
        )
    `)
    .eq('id', payload.new.id)
    .single()
    .then(({ data, error }) => {
        if (error) {
            console.log(error);
        }
        const { members } = data; 
        members.forEach(member => {
            io.of(namespace).to(`user/${member.id}`).emit('group', data);
            console.log('Change received!', member.id, data);
        });
    });
};
export default groupsChanges;