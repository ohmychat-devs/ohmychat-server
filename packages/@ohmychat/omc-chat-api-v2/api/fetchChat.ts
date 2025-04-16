import fetchChatFromSupabase from "../dbQueries/fetchChatFromBase";
import { FetchedChat } from "../utils/types";
import { createMapsObject, mapToArrayObject } from "../utils/functions";
import populateChatMapsObject from "./functions/populateChatMapsObject";

const fetchChat: Function = async function(id): Promise<FetchedChat> {
    const $ = createMapsObject('groups', 'members', 'typing', 'messages', 'users');
    const { data, error } = await fetchChatFromSupabase(id);

    if (error || !data)  console.log(error || 'No data found');
    else populateChatMapsObject(data, $);
    
    return mapToArrayObject($) as FetchedChat;
}

export default fetchChat;