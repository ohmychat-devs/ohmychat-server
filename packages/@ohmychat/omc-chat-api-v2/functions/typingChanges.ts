import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import namespaceAuth from "../namespace";

const typingChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_typing')
        .select(`source(group(members:chat_group_members(user(id))))`)
        .eq('source', payload.new.source)
        .single()

    if (error) {
        console.log(error);
    } else {
        if (!data || !data?.source) return;;

        data.source.group.members.forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/typing', payload.new));
    }
}

export default typingChanges