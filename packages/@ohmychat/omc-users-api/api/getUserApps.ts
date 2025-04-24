import { initUserApps } from "./initUserApps";
import { verifyToken } from "@ohmychat/ohmychat-auth-api";
import { initChatApp } from "./initChatApp";
import { activeUserApps$ } from "../store/userApps";
import { io } from "@ohmychat/ohmychat-backend-core";

/**
 * Manages the retrieval and subscription of user applications.
 * @param socket The socket connection.
 * @returns A function that handles user applications based on provided token.
 */
export const getUserApps = function (socket) {
    return async (token, callback) => {
        try {
            const id = await verifyToken(token); // throws if invalid

            await initChatApp(token, id);
            await initUserApps(id); // Populates activeUserApps$

            socket.join(`user/${id}`);

            const unsubscribe = activeUserApps$(id).onChange(
                ({ value: apps }) => {
                    if (typeof callback === "function") callback(apps);
                    io.of("/users").to(`user/${id}`).emit("active/apps", apps);
                },
                { initial: true, immediate: true }
            );

            return unsubscribe;
        } catch (error) {
            console.error(error);
            if (typeof callback === "function")
                callback({ error: "Unauthorized" });
        }
    };
};
