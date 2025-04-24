import { observable } from "@legendapp/state";
import { supabase } from "@ohmychat/ohmychat-backend-core";
import { apps$ } from "./apps";

type UserApp = { id: string; app: string; active: boolean; user: string; }

/**
 * Stores the current state of the user apps in the database.
 * The key is the user ID and the value is an object with app IDs as keys and user app objects as values.
 */
export const userApps$ = observable<{ [user: string]: { [app: string]: UserApp } }>({});

/**
 * Returns an observable array of the names of the active apps for a given user.
 * @param id The user ID.
 */
export const activeUserApps$ = (id: string) => observable<string[]>(() => {
    let apps = Object?.values(userApps$[id]?.get())
    apps = apps.filter((app) => app?.active && app?.user === id)
    apps = apps.filter((app) => !!app?.app && apps$?.get()[app?.app]?.active);
    const appsNames = apps.map(({ app }) => apps$?.get()[app]?.name);
    return appsNames;
});

/**
 * Called when the apps_users table in the database is updated.
 * Updates the state of the user apps object accordingly.
 * @param payload The payload of the update event.
 */
const userAppChanges = function (payload) {
    userApps$[payload.new.user][payload.new.id].set(payload.new);
}

// Subscribe to the changes in the apps_users table
supabase.channel('ohmychat-realtime-user-apps')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'apps_users' }, userAppChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'apps_users' }, userAppChanges)
    .subscribe();
