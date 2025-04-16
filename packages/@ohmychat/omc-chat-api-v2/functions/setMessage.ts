import { supabase } from "@ohmychat/ohmychat-backend-core";

export default function(channelSrcID, { text, parentID, messageID }) {
    supabase
        .from('chat_group_messages')
        .upsert({
            source: channelSrcID,
            text,
            parent: parentID,
            id: messageID
        }, { onConflict: 'id' })
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
            }
        })
}