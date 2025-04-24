import { supabase } from "@ohmychat/ohmychat-backend-core";

export const findApps = async function (query: string) {
    const { data: apps, error } = await supabase
            .from('apps')
            .select('*, author(*)');

    const appsFiltered = apps?.filter(app => {
        return (
            app.name?.toLowerCase().startsWith(query.toLowerCase()) ||
            app.author?.name?.toLowerCase().startsWith(query.toLowerCase())
        );
    });

    if (error) {
        console.error("Erreur lors de la lecture de la requ te de recherche de l'application :", error);
        return;
    }

    return appsFiltered;
}