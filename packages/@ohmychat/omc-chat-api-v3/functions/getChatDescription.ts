import { getTypeNames } from './getTypeNames';

export const getChatDescription = function (chat) {
    const { lastMessage, typing, members, name, users } = chat;

    const typingAudio = typing.filter(t => t?.status === 'audio');
    const typingText = typing.filter(t => t?.status === 'text');

    // Typing vocal
    if (typingAudio.length > 0) {
        const namesText = getTypeNames(typingAudio, members, users);
        return {
            key: 'chat.typing_audio_dynamic',
            params: { names: namesText }
        };
    }

    // Typing texte
    if (typingText.length > 0) {
        const namesText = getTypeNames(typingText, members, users);
        return {
            key: 'chat.typing_text_dynamic',
            params: { names: namesText }
        };
    }

    const source = members.find(m => m?.id === lastMessage?.source);
    const profile = users[source?.user as string];

    // Message de bienvenue
    if (!lastMessage) {
        return {
            key: 'chat.welcome_message',
            params: { name }
        };
    }

    // Dernier message texte
    if (lastMessage?.text) {
        return {
            key: 'chat.last_message_text',
            params: {
                name: profile?.displayname || source?.user,
                message: lastMessage.text
            }
        };
    }

    return {
        key: 'chat.last_message_generic',
        params: {
            name: profile?.displayname || source?.user
        }
    };
};