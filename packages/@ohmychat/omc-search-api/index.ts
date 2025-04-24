import { io } from "@ohmychat/ohmychat-backend-core";
import jwt from "jsonwebtoken";
import { search } from "./api/search";

const namespaceAuth = '/search';

io.of(namespaceAuth).on('connection', async function(socket) {    
    socket.on('search', async function(token, query, callback) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const id = decoded?.id;

            const src = await search(id, query);
            callback(src);
        } catch (error) {
            
        }
    });

    socket.on('disconnect', function() {
        socket.disconnect();
        socket.removeAllListeners();
    });
});