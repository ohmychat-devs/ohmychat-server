import { supabase } from "@ohmychat/ohmychat-backend-core";
import jwt from "jsonwebtoken";

export const setUserApp = async function (token, data) {
    try {
        const decoded = jwt.decode(token, process.env.JWT_SECRET);
        const id = decoded?.id;

        const { data: existingApp, error: existingAppError } = await supabase
            .from("apps_users")
            .select("*")
            .eq("user", id)
            .eq("app", data.app)
            .maybeSingle();

        //console.log(existingApp);

        if (existingAppError) console.error(existingAppError);

        if (existingApp) {
            const { error: updateError } = await supabase
                .from("apps_users")
                .update({ ...data, user: id })
                .eq("id", existingApp.id);

            if (updateError) console.error(updateError);
        } else {
            const { error: insertError } = await supabase
                .from("apps_users")
                .insert({ ...data, user: id });

            if (insertError) console.error(insertError);
        }
    } catch (error) {
        
    }
}