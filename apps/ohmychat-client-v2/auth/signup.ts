import { supabase, CHDLock } from "@ohmychat/ohmychat-backend-core";
import { verifyToken, signToken } from "./tokens";

export async function signup ({ signup, socket, store }) {
    try {
        const { data: existingUser, error: existingError } = await supabase
            .from('users')
            .select('id')
            .or(`username.eq.${signup.username},email.eq.${signup.email}`)
            .maybeSingle();

        if (existingError) {
            return socket.emit('notify.error', 'auth.signup.error', existingError.message);
        }

        if (existingUser) {
            return socket.emit('notify.error', 'auth.signup.error', 'Username or email already exists');
        }

        const encryptedPassword = CHDLock(process.env.JWT_MASTER_KEY).in(signup.password);

        const { data, error } = await supabase
            .from('users')
            .insert({
                username: signup.username,
                email: signup.email,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error || !data) {
            return socket.emit('notify.error', 'auth.signup.error', error?.message || 'Failed to create user');
        }

        const { error: pwdError } = await supabase
            .from('users_passwords')
            .insert({
                user_id: data.id,
                password: encryptedPassword
            });

        if (pwdError) {
            await supabase.from('users').delete().eq('id', data.id);
            return socket.emit('notify.error', 'auth.signup.error', 'Failed to create password');
        }

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