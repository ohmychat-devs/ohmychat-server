import { observable, observe } from "@legendapp/state";
import { io as io2 } from "socket.io-client";
import readline from "readline/promises";
import fs from "fs";
import { syncTokens } from "./syncTokens";
import { syncCurrentToken } from "./syncCurrentToken";
import { cli } from "./cli";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
console.log('Tape quelque chose (ou "exit" pour quitter)');

const test = io2("http://localhost:80");

test.on("connect", () => {
    const clientTokens = observable<string[]>([]);
    syncTokens(clientTokens);

    const currentToken = observable<string | null>(null);
    syncCurrentToken(currentToken);

    // Observateurs
    observe(clientTokens, ({ value: newState }) => test.emit('auth.tokens', newState));
    observe(currentToken, ({ value: newState, previous: oldState }) => {
        if(!oldState && !newState && clientTokens.get().length > 0) return currentToken.set(clientTokens.get()[0]);
        test.emit('auth.token.current', newState);
    });

    // Gestion des événements serveur
    test.on('auth.token.add', (token) => {
        if (clientTokens.get().includes(token)) return;
        clientTokens.push(token);
        currentToken.set(token);
    });

    test.on('auth.token.delete', (token) => {
        const index = clientTokens.get().indexOf(token);
        if (index !== -1) clientTokens.splice(index, 1);
        if (currentToken.get() === token) logout();
    });

    test.on('notify.error', (...error) => {
        console.log(error);
    });

    test.on('notify.success', (...success) => {
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

        test.emit('auth.login', { identifiant, password });
    }

    cli({ clientTokens, currentToken, login, logout, rl });
    
    test.emit("chat.list");
});