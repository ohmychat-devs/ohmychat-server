import { supabase } from '@ohmychat/ohmychat-backend-core';

export async function getRecentLikes(decoded: any, store: any) {
    const recentlyLikedAuthors = new Set();

    let { data: likes = [] } = await supabase
        .from('sway_likes')
        .select('*, tweet(*)')
        .eq('status', 'active')
        .eq('source', decoded.id);

    store.likes.set(existing => {
        likes ??= [];
        likes = likes?.map(({ tweet, ...like }) => {
            recentlyLikedAuthors.add(tweet.source);
            return { ...like, tweet: tweet.id };
        });
        const likesMap = new Map([...existing, ...likes].map(({ id, ...obj }) => [id, { id, ...obj }]));
        return Array.from(likesMap.values());
    });
    return recentlyLikedAuthors;
}
