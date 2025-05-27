import { login as loginFn } from "./login";
import { signup as signupFn } from "./signup";
export function authEvents ({ socket, store }): void {
    socket.on("auth.tokens", store.tokens.set);
    socket.on("auth.token.current", store.currentToken.set);
    socket.on("auth.login", async (login) => loginFn({ login, socket, store }));
    socket.on("auth.signup", async (signup) => signupFn({ signup, socket, store }));
}