import { supabase } from '@ohmychat/ohmychat-backend-core';

export async function getTweets(decoded: any, store: any, recentlyLikedAuthors: Set<unknown>) {
    const authorsToFetch: string[] = [decoded.id, store.relations.get().map(({ target }) => target), Array.from(recentlyLikedAuthors.values())].flat();

    let { data: tweets = [], error } = await supabase
        .from('sway_tweets')
        .select('*, likes:sway_likes!inner(count), source(*)', { count: 'exact' })
        .eq('status', 'active')
        .in('source', authorsToFetch)
        .eq('likes.status', 'active');

    store.tweets.set(existing => {
        tweets ??= [];
        tweets = tweets?.map(({ source, ...tweet }) => {
            store.users.set(existing => {
                const usersMap = new Map([...existing, source].map(({ id, ...obj }) => [id, { id, ...obj }]));
                return Array.from(usersMap.values());
            });
            return { ...tweet, source: source.id };
        });
        const tweetsMap = new Map([...existing, ...tweets].map(({ id, ...obj }) => [id, { id, ...obj }]));
        return Array.from(tweetsMap.values());
    });
}
