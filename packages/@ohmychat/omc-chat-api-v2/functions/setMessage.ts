import { supabase } from "@ohmychat/ohmychat-backend-core";

export default function({ source, text, parent, id }) {
    console.log({ source, text, parent, id });
    
    supabase
        .from('chat_group_messages')
        .upsert({
            source,
            text,
            parent,
            id
        }, { onConflict: 'id' })
        .select()
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
            }
        })
}