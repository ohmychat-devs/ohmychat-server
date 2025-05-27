import { supabase } from "@ohmychat/ohmychat-backend-core";
import { verifyToken } from "@ohmychat/ohmychat-auth-api";

export const getProfile = async (user_id: string, callback) => {
    const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la récupération du profil :", error);
        return null;
    }
    return callback(data);
}

export const setProfile = async (token: string, profile: any, callback) => {
    const user_id = await verifyToken(token);
    
    const { data, error } = await supabase
        .from("users")
        .upsert({ id: user_id, ...profile }, { onConflict: "id" })
        .select()
        .maybeSingle();

    if (error) {
        console.error("❌ Erreur lors de la mise à jour du profil :", error);
        return null;
    }
    return callback(data);
}