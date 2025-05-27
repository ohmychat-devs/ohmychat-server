import { supabase } from "@ohmychat/ohmychat-backend-core";

export function postManager(socket, decoded: any) {
    socket.on('sway/post', async ({ text, parent, quoting, id, status }: { text: string; parent?: string; quoting?: string; id?: string; status?: string; }, callback) => {
        const { data, error } = await supabase
            .from('sway_tweets')
            .upsert({ id, source: decoded.id, text, parent, quoting, status }, { onConflict: 'id' })
            .select();

        if (error) {
            callback(error);
        } else {
            callback(data);
        }
    });
}