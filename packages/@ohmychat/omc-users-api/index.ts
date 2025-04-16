import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import { getProfile, setProfile } from "./api/profile";
import { getPreferences, setPreferences } from "./api/preferences";
import changes from "./api/changes";

supabase.channel('ohmychat-realtime-users')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, changes)
    .subscribe();

io.of("/users").on("connection", function (socket) {
    console.log("User connected");
    socket.on("preferences/set", async function (user_id, preferences) {
        await setPreferences(user_id, preferences);
    });

    socket.on("preferences/get", async function (user_id) {
        return await getPreferences(user_id);
    });

    socket.on("profile/set", async function (user_id, profile) {
        await setProfile(user_id, profile);
    });

    socket.on("profile/get", async function (user_id, callback) {
        return callback(await getProfile(user_id));
    });

    socket.on("disconnect", function () {
        socket.disconnect();
        socket.removeAllListeners();
    });
});