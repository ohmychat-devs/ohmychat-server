import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import namespaceAuth from "../namespace";

const membersChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.group) return;

        data.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/member', payload.new));
    }
}

export default membersChanges