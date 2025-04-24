export const getGroupName = (c: any, id: string) => {
    return c?.name ?? c?.members?.filter((source: any) =>
            source?.group === c.id &&
            source?.status &&
            source?.user !== id)
        .filter((value, index, self) => self.findIndex(i => i.user === value.user) === index)
        .map((source: any) => c.users[source.user]?.displayname)
        .join(", ")
};