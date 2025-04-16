import { supabase } from "@ohmychat/ohmychat-backend-core";

export const getPreferences = async (user_id: string) => {
    const { data, error } = await supabase
        .from("users_preferences")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la récupération des préférences :", error);
        return null;
    }
    return data;
}

export const setPreferences = async (user_id: string, preferences: any) => {
    const { data, error } = await supabase
        .from("users_preferences")
        .upsert({ user_id, ...preferences }, { onConflict: "user_id" })
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la mise à jour des préférences :", error);
        return null;
    }
    return data;
}