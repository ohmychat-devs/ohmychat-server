import { supabase, CHDLock } from "@ohmychat/ohmychat-backend-core";
import { verifyToken, signToken } from "./tokens";

export async function login ({ login, socket, store }) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*, password:users_passwords(password)')
            .or(`username.eq.${login.identifiant},email.eq.${login.identifiant}`)
            .maybeSingle();

        if (error || !data) {
            const msg = error?.message || 'User not found';
            return socket.emit('notify.error', 'auth.login.error', msg);
        }

        const decryptedPassword = CHDLock(process.env.JWT_MASTER_KEY).out(data.password?.password);
        if (decryptedPassword !== login.password) return socket.emit('notify.error', 'auth.login.error', 'Invalid password');

        const existingToken = store.tokens.get()?.find(token => {
            try {
                const payload = verifyToken(token, socket)
                return payload?.id === data.id;
            } catch (e) {
                return false;
            }
        });

        if (existingToken) {
            socket.emit('auth.token.add', existingToken);
            store.currentToken.set(existingToken);
            return socket.emit('notify.error', 'auth.login.error', 'User already connected');
        }

        const token = signToken(data.id);
        socket.emit('auth.token.add', token);
        socket.emit('notify.success', 'auth.login.success', data.id);
    } catch (err) {
        console.error("auth.login error:", err);
        socket.emit('notify.error', 'auth.login.error', 'Internal server error');
    }
}