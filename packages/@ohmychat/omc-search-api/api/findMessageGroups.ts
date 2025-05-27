import { supabase } from "@ohmychat/ohmychat-backend-core";

export default async function (id: string, query: string) : Promise<{ messages?: any[]; groups?: any[] }> {
    let { data, error } = await supabase
        .from('chat_group_members')
        .select(`group(
            id,
            name,
            members:chat_group_members!inner(
                user:users!inner(id, username, displayname),
                group:chat_groups!inner(id, name),
                messages:chat_group_messages!chat_group_messages_source_fkey(*, source(*))
            )
        )`)
        .eq('user', id);

    if (error) {
        console.error("❌ Erreur lors de la recherche de groupes de messages :", error);
        return null;
    }

    data = data?.map(({ group }) => group);

    const groups = data?.filter(({ name, members }) => {
        return name?.toLowerCase().includes(query.toLowerCase()) || members?.some(({ user }) => {
            return user.username?.toLowerCase().startsWith(query.toLowerCase()) || user.displayname?.toLowerCase().startsWith(query.toLowerCase());
        });
    }).map(({ members, ...group }) => {
        return {
            ...group,
            members: members.map(({ user }) => user)
        };
    }) || [];

    const messages = data?.flatMap(({ members }) => {
        return members?.flatMap(({ messages }) => {
            return messages;
        });
    }).filter(({ text }) => {
        return text?.toLowerCase().startsWith(query.toLowerCase());
    }) || [];

    return { messages, groups };
}