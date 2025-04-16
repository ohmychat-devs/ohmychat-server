import { supabase } from "@ohmychat/ohmychat-backend-core";

export default async function (source: string) {
    const { data, error } = await supabase
        .from("relations")
        .select("*")
        .or(`source.eq.${source},target.eq.${source}`);

    if (error) {
        console.error("❌ Erreur lors de la récupération des relations :", error);
        return null;
    }
    return data;
}
