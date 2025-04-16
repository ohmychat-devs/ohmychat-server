import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import createChatGroupFromRelation from "./createChatGroupFromRelation";

export default async function (source: string, target: string, status: string) {
    const { data: relations, error: relationsError } = await supabase
        .from("relations")
        .select("*")
        .eq("source", source)
        .eq("target", target)
        .maybeSingle();

    if (relationsError) {
        console.error("❌ Erreur lors de la récupération des relations :", relationsError);
        return null;
    }

    if (!relations) {
        const { data, error } = await supabase
            .from("relations")
            .insert({ source, target, status })
            .select()
            .single();

        if (error) {
            console.error("❌ Erreur lors de la création de la relation :", error);
            return null;
        }
        return data;
    }

    const { data, error } = await supabase
        .from("relations")
        .update({ status })
        .eq("id", relations.id)
        .select()
        .single();

    if (error) {
        console.error("❌ Erreur lors de la mise à jour de la relation :", error);
        return null;
    }

    if (status === "block") {
        await supabase
            .from("relations")
            .update({ status: null })
            .eq("source", target)
            .eq("target", source);
    }

    if (status === "follow") {
        const { data: mutualRelation } = await supabase
            .from("relations")
            .select('status')
            .eq("source", target)
            .eq("target", source)
            .maybeSingle();

        console.log("Mutual relation:", mutualRelation);
        if (mutualRelation?.status === "follow") {
            createChatGroupFromRelation(target, source).then(() => {
                console.log("Chat group created from relation:", target, source);
            });
        }
    }

    return data;
}