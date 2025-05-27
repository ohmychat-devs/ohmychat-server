import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import { verifyToken } from "@ohmychat/ohmychat-auth-api";
import mime from 'mime-types';

io.of('/files').on('connection', (socket) => {
    try {
        socket.on('upload', async (token, blob, type, callback) => {
            const id = await verifyToken(token);
    
            const name = `./${id}/${Date.now()}.${mime.extension(type)}`;
            const { data, error } = await supabase.storage.from('ohmychat-files').upload(name, blob, { upsert: true, contentType: type });
            if (error) console.error(error);
            if (data) callback(data.id);
        });
    
        socket.on('media', async (token, path, callback) => {
            if (!path || !token) return;
            const user_id = await verifyToken(token);
    
            const { data } = await supabase.storage.from('ohmychat-files').getPublicUrl(path);
            if (data) {
                callback({
                    type : mime.lookup(path),
                    src : data.publicUrl
                });
            }
        });
    } catch (error) {
        
    }
});