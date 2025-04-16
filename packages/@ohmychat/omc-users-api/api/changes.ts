import { io, supabase } from "@ohmychat/ohmychat-backend-core";

export default async (payload) => {
    console.log('users updated');
    const network = new Set<string>();

    const { data: relations } = await supabase
        .from("relations")
        .select("*")
        .or('source.eq.' + payload.new.id + ',target.eq.' + payload.new.id);
        
    relations?.forEach((relation) => {
        network.add(relation.source);
        network.add(relation.target);
    });

    const { data: chat } = await supabase
        .from("chat_group_members")
        .select("group(id, members:chat_group_members(user))")
        .eq("user", payload.new.id);

    chat?.forEach(({ group: { members } }) => {
        members.forEach(({ user }) => {
            network.add(user);
        });
    });

    network.forEach((user_id) => {
        io.of("/users").to("user/" + user_id).emit("incoming/user", payload.new);
    });
}