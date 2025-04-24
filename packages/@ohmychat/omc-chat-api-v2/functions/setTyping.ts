import { supabase } from "@ohmychat/ohmychat-backend-core";

const setTyping = function({ status, source }) {
    supabase
        .from('chat_group_typing')
        .upsert({
            source,
            status,
            date: new Date().toISOString(),
        }, { onConflict: 'source' })
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
            }
        });
}

export default setTyping