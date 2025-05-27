import jwt from "jsonwebtoken";

export const verifyToken = (token: string, socket) => {
    try {
        return jwt.verify(token, process.env.JWT_MASTER_KEY);
    } catch (error) {
        socket.emit('auth.token.delete', token);
        socket.emit('notify.error', 'auth.token.error', 'Invalid token');
        return false;
    }
}

export const signToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_MASTER_KEY, { expiresIn: '30d' })
}

export const idFromToken = (token: string) => {
    try {
        return jwt.verify(token, process.env.JWT_MASTER_KEY).id;
    } catch (error) {
        return null;
    }
}