import jwt from 'jsonwebtoken';
import { generateFeed } from './generateFeed';
import { likesManager } from './likesManager';
import { postManager } from './postManager';
import { emitterManager } from './emitterManager';
import { verifyToken } from '../omc-auth-api/functions/verifyToken';

export function initSwayClient(socket, store, realtime) {
    socket.on('sway/init', async (token, callback) => {
        const id = await verifyToken(token);
        const decoded = { id };

        emitterManager(decoded, realtime, store);
        generateFeed(decoded, store, callback);
        likesManager(socket, decoded, store);
        postManager(socket, decoded);
    });
}
