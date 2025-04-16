import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import namespaceAuth from "../namespace";

const messagesChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_messages')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('id', payload.new.id)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;;

        data.source.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/message', payload.new));
    }
}

export default messagesChanges