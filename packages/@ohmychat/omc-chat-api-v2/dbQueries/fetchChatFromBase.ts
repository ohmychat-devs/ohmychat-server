import { supabase } from "@ohmychat/ohmychat-backend-core";
import { InitChatData } from "../utils/types";

type ChatQueryResponse = { data: InitChatData | null; error: any }

export default async (id: string): Promise<ChatQueryResponse> => {
    return await supabase
        .from('chat_group_members')
        .select(`group(
            *, members:chat_group_members!inner(
                *,
                userData:users!inner(*),
                typing:chat_group_typing(*),
                messages:chat_group_messages!chat_group_messages_source_fkey(*)
            )
        )`)
        .eq('user', id) as ChatQueryResponse
}