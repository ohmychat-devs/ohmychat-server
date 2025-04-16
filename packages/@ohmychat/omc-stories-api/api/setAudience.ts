import { supabase } from "@ohmychat/ohmychat-backend-core";

export default async (data, callback?) => {
    const { id, source, name, targets } = data;

    if (!name || !Array.isArray(targets)) return callback({ message: "Paramètres invalides", });

    type Payload = { id?: string, name: string, targets: string[], source: string };
    const payload : Payload = { source, name, targets };
    if (id) payload.id = id;

    const { data: upserted, error } = await supabase
        .from("audiences")
        .upsert(payload, { onConflict: id ? "id" : undefined })
        .select();

    if (error) {
        console.error("Erreur upsert audience:", error);
        return callback({ message: error.message });
    }

    callback(upserted);
};