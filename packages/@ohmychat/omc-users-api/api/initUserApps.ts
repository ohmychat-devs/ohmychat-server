import { supabase } from "@ohmychat/ohmychat-backend-core";
import { userApps$ } from "../store/userApps";

export const initUserApps = async (id: string) => {
    if (!userApps$[id].get()) {
        const { data: apps, error } = await supabase
            .from("apps_users")
            .select("*")
            .eq("user", id)
        
        if (error) return;

        const appsMap = Object.fromEntries(apps.map(app => [app.id, app]));
        userApps$[id].set(appsMap);
    }

    return userApps$[id].get();
}