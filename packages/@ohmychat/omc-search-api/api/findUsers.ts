import { supabase } from "@ohmychat/ohmychat-backend-core";

/**
 * Recherche un utilisateur par ID ou par une chaîne de caractères qui apparait dans son nom d'utilisateur ou son nom d'affichage.
 * @param {string} id - ID de l'utilisateur qui recherche.
 * @param {string} query - Chaîne de caractères à chercher.
 * @returns {Promise<Array>} - Promesse qui résout en un tableau d'objets User qui correspondent à la recherche.
 */
export default async (id: string, query: string) => {
    const { data: relations, error: relationsError } = await supabase
        .from("relations")
        .select("*")
        .or(`source.eq.${id},target.eq.${id}`);

    if (relationsError) {
        console.error("❌ Erreur lors de la récupération des relations :", relationsError);
        return null;
    }

    const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(`username.ilike.${query}%,displayname.ilike.${query}%`);

    if (error) {
        console.error("❌ Erreur lors de la recherche de l'utilisateur :", error);
        return null;
    }

    return data.filter((user) => {
        return !relations?.find(({ source, target, status }) => {
            return source === user.id && target === id && status === "block";
        });
    });
}
