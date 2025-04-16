import { supabase } from "@ohmychat/ohmychat-backend-core";

export default async function (target: string, source: string) {
    const { data: mutualRelationChatGroup, error: mutualRelationChatGroupError } = await supabase
        .from("chat_groups")
        .select("check_members:chat_group_members!inner(group(id, members:chat_group_members(user)))")
        .or(`user.eq.${source},user.eq.${target}`, { foreignTable: "check_members" });

    console.log("Mutual relation chat group:", mutualRelationChatGroup, "error:", mutualRelationChatGroupError);
    
    const sortMmbrs: any = mutualRelationChatGroup?.reduce((acc, item) => {
        item.check_members.forEach(({ group }: any) => {
            if (!acc[group?.id]) acc[group?.id] = new Set();
            group?.members.forEach(({ user }) => { acc[group.id].add(user); });
        });
        return acc;
    }, {});

    const existingChatGroup: any = Object.entries(sortMmbrs)
        .map(([id, members]: any) => ({ id, members: Array.from(members) }))
        .find(({ members }) => members.includes(source) && members.includes(target) && members.length === 2);

    if (existingChatGroup) {
        console.log("Groupe de discussion existant trouvé :", existingChatGroup);
        const { error: chatGroupMembersError } = await supabase
            .from("chat_group_members")
            .update({ status: "active" })
            .eq("group", existingChatGroup.id)
            .or(`user.eq.${source},user.eq.${target}`);

        if (chatGroupMembersError) {
            return console.error("❌ Erreur lors de la mise à jour des membres du groupe de discussion :", chatGroupMembersError);
        }
        
        return;
    }
    
    const { data: new_chat_group, error: new_chat_group_error } = await supabase
        .from("chat_groups")
        .insert({ created_by: source })
        .select()
        .single();

    if (new_chat_group_error) {
        return console.error("❌ Erreur lors de la création de groupe de discussion :", new_chat_group_error);
    } 
    
    console.log("Groupe de discussion créé avec succès :", new_chat_group);
    const { data: new_chat_members, error: new_chat_members_error } = await supabase
        .from("chat_group_members")
        .insert([
            { group: new_chat_group.id, user: source, status: "active" },
            { group: new_chat_group.id, user: target, status: "active" }
        ])
        .select();

    if (new_chat_members_error) {
        console.error("❌ Erreur lors de l'ajout des membres au groupe de discussion :", new_chat_members_error);
        supabase
            .from("chat_groups")
            .delete()
            .eq("id", new_chat_group?.id)
            .then(({ data, error }) => {
                if (error) {
                    console.error("❌ Erreur lors de la suppression du groupe de discussion :", error);
                } else {
                    console.log("Groupe de discussion supprimé avec succès :", data);
                }
            });
    } else {
        console.log("Membres ajoutés au groupe de discussion avec succès :", new_chat_members);
    }
}