export const getLatestDate = function (chat: any): number {
    const dates: Date[] = [];
  
    const { lastMessage, typing, created_at } = chat;
  
    if (created_at) {
        dates.push(new Date(created_at));
    }

    dates.push(new Date(lastMessage?.published_at ?? lastMessage?.created_at ?? lastMessage?.typed_at ?? lastMessage?.date ?? 0));
  
    if (Array.isArray(typing)) {
      typing.forEach(t => {
        if (t.date) {
          dates.push(new Date(t.date));
        }
      });
    }
  
    const latest = dates.sort((a, b) => b.getTime() - a.getTime())[0];
  
    return latest?.getTime() ?? 0;
}