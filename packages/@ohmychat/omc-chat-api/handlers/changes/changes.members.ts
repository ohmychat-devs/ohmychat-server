import { io, supabase } from "../../../omc-backend-core";
import { namespace } from "../../namespace";

const membersChanges = (payload) => {
    supabase
    .from('chat_group_members')
    .select(`
        id,
        group(
            *,
            members:chat_group_members(
                id,
                user(*),
                group(*),
                last_msg_seen(*)
            )
        ),
        user(*),
        last_msg_seen(*)
    `)
    .eq('id', payload.new.id)
    .single()
    .then(({ data, error }) => {
        if (error) {
            console.log(error);
        }

        const { group: { members } } = data; 
        members.forEach(member => {
            io.of(namespace).to(`user/${member.id}`).emit('message', data);
            console.log('Change received!', member.id, data);
        })
    });
};
export default membersChanges;