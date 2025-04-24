export const getChatDescription = function (chat) {
    const { lastMessage, typing, members, name, users } = chat;

    const typingAudio = typing.filter(t => t.status === 'audio');
    const typingText = typing.filter(t => t.status === 'text');

    const getTypeurNames = (typingList) => {
        const names = typingList
            .map(t => members.find(s => s.id === t.source))
            .map(m => {
                const profile = users[m?.user];
                return profile?.displayname || m?.user || null;
            })
            .filter(Boolean);

        if (names.length === 1) {
            return names[0];
        } else if (names.length === 2) {
            return `${names[0]} et ${names[1]}`;
        } else if (names.length > 2) {
            const othersCount = names.length - 2;
            return `${names[0]}, ${names[1]} et ${othersCount} autres`;
        }
        return null;
    };

    // Typing vocal
    if (typingAudio.length > 0) {
        const namesText = getTypeurNames(typingAudio);
        return {
            key: 'chat.typing_audio_dynamic',
            params: { names: namesText }
        };
    }

    // Typing texte
    if (typingText.length > 0) {
        const namesText = getTypeurNames(typingText);
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