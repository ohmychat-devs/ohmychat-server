import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import namespaceAuth from "../namespace";

const userChanges = async (payload) => {
    const { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(members:chat_group_members(user(id)))`)
        .eq('user', payload.new.id)

    if (error) {
        console.log(error);
    } else {
        data.map(g => g.group.members).flat().forEach(({ user : { id } }) => io.of(namespaceAuth).to('user/' + id).emit('incoming/user', payload.new));
    }
}

export default userChanges