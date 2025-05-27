export const getTypeNames = (typingList, members, users) => {
    const names = typingList
        .map(t => members.find(s => s?.id === t?.source))
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