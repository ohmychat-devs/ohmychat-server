import { setUserApp } from "./setUserApp";
import { supabase } from "@ohmychat/ohmychat-backend-core";

export const initChatApp = async function (token, id) {
    const { data : app, error: appError } = await supabase
        .from("apps")
        .select("*")
        .eq("name", "chat")
        .single();

    if (appError) console.error(appError);
    setUserApp(token, { app: app.id, user: id });
}