import { verifyToken } from "@ohmychat/ohmychat-auth-api";
import { supabase } from "@ohmychat/ohmychat-backend-core";

export const getPreferences = async (token: string, callback) => {
    const user_id = await verifyToken(token);

    const { data, error } = await supabase
        .from("users_preferences")
        .select("*")
        .eq("user_id", user_id)
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la récupération des préférences :", error);
        return null;
    }
    return callback(data);
}

export const setPreferences = async (token: string, preferences: any, callback) => {
    const user_id = await verifyToken(token);

    const { data, error } = await supabase
        .from("users_preferences")
        .upsert({ user_id, ...preferences }, { onConflict: "user_id" })
        .select()
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la mise à jour des préférences :", error);
        return null;
    }
    return callback(data);
}