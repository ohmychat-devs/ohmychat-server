import { app, io, server } from "@ohmychat/ohmychat-backend-core";
import { syncEvents, authEvents } from "./auth";
import { createStore } from "./store";
import { chatEvents } from "./chat";
import chalk from "chalk"; 

io.of("/").on("connection", (socket) => {
    socket.onAny((event, data) => console.log(`${chalk.cyan("[socket <-]")} ${event}`, data));
    socket.onAnyOutgoing((event, data) => console.log(`${chalk.magenta("[socket ->]")} ${event}`, data));

    const { store, sync } = createStore();
    const ctxt = { socket, store, sync };

    socket.on("route.check", (route) => {
        const currentToken = store.currentToken.get();
        console.log("currentToken", currentToken);

        if (route === "/login" && currentToken) {
            socket.emit("route.redirect", "/");
        }
        if (route === "/" && !currentToken) {
            socket.emit("route.redirect", "/login");
        }
    });

    syncEvents(ctxt);
    authEvents(ctxt);
    chatEvents(ctxt);
});

app.get("*", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <title>OhMyChat</title>
                <script src="https://cdn.jsdelivr.net/npm/@legendapp/state@2.1.15/index.min.js"></script>
                <script src="/socket.io/socket.io.js"></script>
                <script type="module">
                    const socket = io();
                    socket.on('connect', () => {
                        console.log('Connected to server');
                        const route = window.location.pathname;
                        socket.emit('route.check', route);
                        socket.on('route.redirect', (route) => {
                            window.location.href = route;
                        });
                    });

                    const clientTokens = observable([]);
                    //syncTokens(clientTokens);

                    const currentToken = observable(null);
                    //syncCurrentToken(currentToken);

                    // Observateurs
                    observe(clientTokens, ({ value: newState }) => socket.emit('auth.tokens', newState));
                    observe(currentToken, ({ value: newState, previous: oldState }) => {
                        if(!oldState && !newState && clientTokens.get().length > 0) return currentToken.set(clientTokens.get()[0]);
                        socket.emit('auth.token.current', newState);
                    });

                    // Gestion des événements serveur
                    socket.on('auth.token.add', (token) => {
                        if (clientTokens.get().includes(token)) return;
                        clientTokens.push(token);
                        currentToken.set(token);
                    });

                    socket.on('auth.token.delete', (token) => {
                        const index = clientTokens.get().indexOf(token);
                        if (index !== -1) clientTokens.splice(index, 1);
                        if (currentToken.get() === token) logout();
                    });

                    socket.on('notify.error', (...error) => {
                        console.log(error);
                    });

                    socket.on('notify.success', (...success) => {
                        console.log(success);
                    });

                    const logout = () => {
                        const token = currentToken.get();
                        const tokens = clientTokens.get();
                        const newTokens = tokens.filter(t => t !== token);

                        clientTokens.set(newTokens);

                        if (newTokens.length > 0) currentToken.set(newTokens[0]);
                        else currentToken.set(null);
                    };
                    
                    async function login() {
                        const identifiant = await rl.question('Identifiant : ');
                        const password = await rl.question('Mot de passe : ');

                        socket.emit('auth.login', { identifiant, password });
                    }
                </script>
            </head>
            <body>
                <h1>Welcome to OhMyChat</h1>
            </body>
        </html>
    `);
});

server.listen(80, () => {
    console.log("Server is running on port 80");
});

//import "./client";