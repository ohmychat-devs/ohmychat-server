import { supabase } from "@ohmychat/ohmychat-backend-core";

export const getProfile = async (user_id: string) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la récupération du profil :", error);
        return null;
    }
    return data;
}

export const setProfile = async (user_id: string, profile: any) => {
    const { data, error } = await supabase
        .from("users")
        .upsert({ id: user_id, ...profile }, { onConflict: "id" })
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la mise à jour du profil :", error);
        return null;
    }
    return data;
}