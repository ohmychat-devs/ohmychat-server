import { getChatDescription } from "../../functions/getChatDescription";
import { getLatestDate } from "../../functions/getLatestDate";
import { getGroupName } from "../../functions/getGroupName";
import { getUnreadMessagesCount } from "../../functions/getUnreadMessagesCount";
import { msgsSorter } from "../../functions/msgsSorter";
import { UserChatData } from "../../types";

/**
 * Formate un objet groupe de chat pour l'affichage dans la liste des chats utilisateur.
 *
 * @param {Object} chat - Le groupe de chat à formater.
 * @param {string} userId - L'identifiant de l'utilisateur courant.
 * @param {UserChatData} param2 - Données utilisateur associées (messages, membres, utilisateurs, typing).
 * @returns {Object} Objet formaté contenant id, name, description, lastActivity et unreadMessagesCount.
 */
export function formatChat(chat, userId, { messagesByGroup, typing, members, users }: UserChatData) {
    const lastMessage = messagesByGroup[chat?.id]?.toSorted(msgsSorter).at(-1);
    const enrichedChat = { ...chat, lastMessage, typing, members, users, messages: messagesByGroup[chat?.id] || [] };
  
    return {
      id: chat?.id,//+`${Math.random().toString(36).substring(2, 9)}`,
      name: getGroupName(enrichedChat, userId),
      description: getChatDescription(enrichedChat),
      lastActivity: getLatestDate(enrichedChat),
      unreadMessagesCount: getUnreadMessagesCount(enrichedChat, userId),
    };
}