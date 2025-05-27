import { io } from "@ohmychat/ohmychat-backend-core";
import { getProfile, setProfile } from "./api/profile";
import { getPreferences, setPreferences } from "./api/preferences";
import { apps$ } from "./store/apps";
import { setUserApp } from "./api/setUserApp";
import { getUserApps } from "./api/getUserApps";
import { getTokenProfile } from "./api/getTokenProfile";

io.of("/users").on("connection", function (socket) {
    socket.emit("apps", apps$.get());

    socket.on("apps/token/get", getUserApps(socket));
    socket.on("apps/token/set", setUserApp);

    socket.on("preferences/get", getPreferences);
    socket.on("preferences/set", setPreferences);

    socket.on("profile/get", getProfile);
    socket.on("profile/token/set", setProfile);
    socket.on("profile/token/get", getTokenProfile);

    socket.on("disconnect", function () {
        socket.disconnect();
        socket.removeAllListeners();
    });
});