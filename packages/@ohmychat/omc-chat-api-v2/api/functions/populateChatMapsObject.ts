const populateChatMapsObject: Function = function(data, $): void {
    data?.forEach(({ group }) => {
        if (!group) return;

        const { members: membersData = [], ...groupData } = group;
        $.groups.set(group.id, groupData);
        
        membersData?.forEach(member => {
            const { typing: typingData, messages: messagesData, userData, ...memberData } = member;
            $.members.set(member.id, memberData);
            if (typingData) $.typing.set(member.id, typingData);
            if (userData) $.users.set(userData.id, userData);
            for (const message of messagesData) $.messages.set(message.id, message);
        });
    });
}

export default populateChatMapsObject