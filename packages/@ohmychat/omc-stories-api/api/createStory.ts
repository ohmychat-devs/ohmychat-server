import { supabase } from "@ohmychat/ohmychat-backend-core";

const createStory = async (user: string, content: string) => {
    const { data, error } = await supabase
        .from("stories")
        .insert({ user, content })
        .select()
        .single();

    if (error) {
        console.error("❌ Erreur lors de la création de la story :", error);
        return null;
    }
    return data;
};

export default createStory;