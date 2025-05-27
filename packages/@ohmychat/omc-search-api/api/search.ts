import findMessageGroups from "./findMessageGroups";
import findUsers from "./findUsers";
import { findApps } from "./findApps";
import { events } from "@ohmychat/ohmychat-backend-core";

export const search = async function (id: string, query: string) {
    try {
        console.log("Recherche en cours...");

        const date = Date.now();
        events.emit(`search_messages_${id}`, date, () => {
            events.once(`search_messages_${id}_${date}`, () => {
                console.log("Recherche terminée.");
            })
        });

        const users = await findUsers(id, query);
        const { messages, groups } = await findMessageGroups(id, query);
        const apps = await findApps(query);

        return { users, messages, groups, apps };
    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
    }
}