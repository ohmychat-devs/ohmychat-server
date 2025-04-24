import { supabase } from "@ohmychat/ohmychat-backend-core";
import jwt from "jsonwebtoken";

const setseen = function({
    last_msg_seen,
    user,
    group
}) {
    const decoded = jwt.verify(user, process.env.JWT_SECRET);
    if (!decoded) return;
    
    user = decoded?.id;

    supabase
        .from('chat_group_members')
        .select('id')
        .eq('user', user)
        .eq('group', group)
        .single()
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
                return;
            }

            if (data) {
                supabase
                    .from('chat_group_members')
                    .update({ last_msg_seen, user, group })
                    .eq('id', data.id)
                    .then(({ data, error }) => {
                        console.log(data);
                        if (error) {
                            console.log(error);
                        }
                    });
            } else {
                supabase
                    .from('chat_group_members')
                    .insert({ last_msg_seen, user, group })
                    .then(({ data, error }) => {
                        console.log(data);
                        if (error) {
                            console.log(error);
                        }
                    });
            }
        });
}

export default setseen