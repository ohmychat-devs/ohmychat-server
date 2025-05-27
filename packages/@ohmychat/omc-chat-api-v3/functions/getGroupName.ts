export const getGroupName = (c: any, id: string) => {
    const nameFromMembers = function (c) {
        // Si le groupe a un nom explicite, on le retourne
        if (c?.name) return c.name;
    
        // Récupère les membres actifs autres que l'utilisateur courant
        const members = c?.members
            ?.filter((source: any) =>
                source?.group === c.id &&
                source?.status &&
                source?.user !== id)
            .filter((value, index, self) => self.findIndex(i => i.user === value.user) === index);
    
        // Si l'utilisateur est seul dans le groupe, retourne son displayname et username
        if (!members || members.length === 1) {
            const user = c.users?.[id];
            if (user) {
                return {
                    displayname: user.displayname,
                    username: user.username
                };
            }
            return null;
        }
    
        // Sinon, retourne la liste des displaynames des autres membres
        return { displayname: members.map((source: any) => c.users[source.user]?.displayname).join(", ") };
    };

    return c?.name ?? nameFromMembers(c);
};