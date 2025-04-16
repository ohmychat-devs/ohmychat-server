import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import namespaceAuth from "../namespace";

const groupChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_groups')
        .select(`members:chat_group_members(user(id))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.members) return;

        data.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/group', payload.new));
    }
}

export default groupChanges