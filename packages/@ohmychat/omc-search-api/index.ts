import { io } from "@ohmychat/ohmychat-backend-core";
import findMessageGroups from "./api/findMessageGroups";
import findUsers from "./api/findUsers";

const namespaceAuth = '/search';

const search = async function (id: string, query: string) {
    try {
        console.log("Recherche en cours...");

        const user = await findUsers(id, query);
        const { messages, groups } = await findMessageGroups(id, query);

        return { user, messages, groups };
    } catch (error) {
        console.error("Erreur lors de la recherche :", error);
    }
}

io.of(namespaceAuth).on('connection', async function(socket) {    
    socket.on('search', async function(token, query, callback) {
        const src = await search(token, query);
        callback(src);
    });

    socket.on('disconnect', function() {
        socket.disconnect();
        socket.removeAllListeners();
    });
});