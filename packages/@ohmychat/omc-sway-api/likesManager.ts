import { supabase } from "@ohmychat/ohmychat-backend-core";

export function likesManager(socket, decoded: any, store) {
    socket.on('like', async (tweetId, status = 'active') => {
        const { data: existingLike, error } = await supabase
            .from('sway_likes')
            .select('*')
            .eq('source', decoded.id)
            .eq('tweet', tweetId)
            .maybeSingle();

        if (error) console.error(error);

        if (existingLike) {
            const { data: updatedLike, error } = await supabase
                .from('sway_likes')
                .update({ status })
                .eq('id', existingLike.id);

            if (error) console.error(error);
            console.log(updatedLike);
        } else {
            const { data: newLike } = await supabase
                .from('sway_likes')
                .insert({ source: decoded.id, tweet: tweetId, status: 'active' })
                .select();
            console.log(newLike);
        }
    });

    store.likes.onChange(({ value }) => {
        const likedTweets = Object.groupBy(value, ({ source }) => source)[decoded.id]?.filter(({ status }) => status === 'active').map(({ tweet }) => tweet);
        socket.emit('sway/likes', likedTweets);
    }, { initial: true, immediate: true });
}