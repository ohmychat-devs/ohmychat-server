import { observable } from "@legendapp/state";
import { io, supabase } from "@ohmychat/ohmychat-backend-core";

type App = { id: string; name: string; settings: any | null; active: boolean; author: string; };
type Author = { id: string; name: string; active: boolean; };

/**
 * Stores the current state of the apps in the database.
 */
const apps$ = observable<{[appID: string]: App}>({});

/**
 * Stores the current state of the authors in the database.
 */
const authors$ = observable<{[authorID: string]: Author}>({});

/**
 * Called when the apps table in the database is updated.
 * Updates the state of the apps object accordingly.
 * @param {Object} payload - The payload of the update event.
 */
const appChanges = (payload) => apps$[payload.new.id].set(payload.new);

/**
 * Listens to changes in the apps and authors tables
 * in the database and updates the state of the
 * apps and authors accordingly.
 */
supabase.channel('ohmychat-realtime-apps')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'apps' }, appChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'apps' }, appChanges)
    .subscribe()

/**
 * Listens to changes in the apps object and updates the state
 * of the authors object accordingly.
 */
apps$.onChange(({ value: apps }) => io.of("/users").emit("apps", { apps, authors: authors$.get() }), { initial: true, immediate: true });

/**
 * Fetches apps and their authors from the database and updates
 * the state of the apps and authors observables.
 */
supabase
    .from("apps")
    .select("*, author(*)")
    .then(({ data: apps, error }) => {
        if (error) {
            console.error(error);
            return;
        }
        apps?.forEach(({ author, ...app }) => {
            apps$[app.id].set({ ...app, author });
            authors$[author.id].set(author);
        });
    });

export { apps$, authors$ };