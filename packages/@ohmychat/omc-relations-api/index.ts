import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import setRelation from "./api/setRelation";
import getRelations from "./api/getRelations";
import relationsChanges from "./api/relationsChanges";

supabase.channel('ohmychat-realtime-relations')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'relations' }, relationsChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'relations' }, relationsChanges)
    .subscribe();

io.of("/relations").on("connection", async function (socket) {
    socket.on("set/relation", async function (source, target, status) {
        const src = await setRelation(source, target, status);
        socket.emit("set/relation", src);
    });

    socket.on("get/relations", async function (source) {
        const src = await getRelations(source);
        socket.emit("get/relations", src);
    });

    socket.on("disconnect", function () {
        socket.disconnect();
        socket.removeAllListeners();
    });
});