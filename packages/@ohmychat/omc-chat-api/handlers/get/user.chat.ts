import { CHDLock, supabase } from "@ohmychat/ohmychat-backend-core";
import JWT from "jsonwebtoken";

export default (token, callback) => {
    const MK = process.env.JWT_MASTER_KEY;

    JWT.verify(CHDLock(MK).out(token), MK, async function(err, decoded) {
        if (err) {
            return console.log(err);
        }
        const { id } = decoded;
        
        supabase
        .from('users')
        .select(`
            user_groups:chat_group_members(
                group:chat_groups(
                    *,
                    created_by(*),
                    members:chat_group_members(
                        id,
                        group(*),
                        user(*),
                        messages:chat_group_messages!chat_group_messages_source_fkey(
                            *,
                            source(
                                group(*),
                                user(*)
                            ),
                            parent(
                                *,
                                source(
                                    group(*),
                                    user(*)
                                )
                            )
                        ),
                        last_msg_seen(*)
                    )
                )
            )
        `)
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
            if (error) {
                console.log(error);
            }

            const messages = data
                .user_groups
                .map(({ group }) => group
                    .members
                    .map(({ messages }) => messages)
                    .flat())
                .flat()
                .sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());

            const groups = data
                .user_groups
                .map(({ group }) => {
                    const members = group
                        .members
                        .map(membership => {
                            const { last_msg_seen, user, group } = membership;
                            return { user, group, last_msg_seen }
                        });

                    const last_msg = group
                        .members
                        .map(({ messages }) => messages)
                        .flat()
                        .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())[0];

                    return { ...group, members, last_msg }
                })
                .sort((a, b) => new Date(b.last_msg.published_at ?? b.created_at).getTime() - new Date(a.last_msg.published_at ?? a.created_at).getTime());

            callback({ groups, messages });
        });
    })
};