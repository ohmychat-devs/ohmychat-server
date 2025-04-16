import { io, supabase } from "../../../omc-backend-core";
import { namespace } from "../../namespace";

const messagesChanges = (payload) => {
    supabase
    .from('chat_group_messages')
    .select(`
        *,
        source(*),
        parent(
            *,
            source(*)
        )
    `)
    .eq('id', payload.new.id)
    .single()
    .then(({ data, error }) => {
        if (error) {
            console.log(error);
        }
        io.of(namespace).to('group/' + data.group).emit('message', data);
        console.log('Change received!', data);
    });
};
export default messagesChanges;