import { app, io, supabase } from "@ohmychat/ohmychat-backend-core";
import login from "./handlers/login";
import cookies from "./handlers/cookies";
import active from "./handlers/active";
import logout from "./handlers/logout";
import namespaceAuth from "./constants/namespace";

app.get(namespaceAuth+'/cookies', cookies);
app.post(namespaceAuth+'/login', login);
app.get(namespaceAuth + '/logout/:code', logout);
app.get(namespaceAuth + '/active/:code', active);

io.of(namespaceAuth).on('connection', function(socket) {
    socket.on('join', (room) => {
        socket.join(room);
    })
    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
});

export { verifyToken } from "./functions/verifyToken";