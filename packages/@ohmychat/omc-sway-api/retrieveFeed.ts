export function retrieveFeed(store: any) {
    const tweets = store.tweets.get();
    const tweetMap = new Map(tweets.map(tweet => [tweet.id, tweet]));
    const usersMap = new Map(store.users.get().map(user => [user.id, user]));

    // Récursion avec cache pour éviter les appels répétés
    const resolved = new Map();

    function resolveTweet(tweet) {
        if (!tweet || resolved.has(tweet.id)) {
            return resolved.get(tweet.id) || tweet;
        }

        const newTweet = { ...tweet };

        const user = usersMap.get(newTweet.source);
        newTweet.source = { displayname: user.displayname, username: user.username };

        if (tweet.quoting) {
            newTweet.quoting = resolveTweet(tweetMap.get(tweet.quoting));
        }

        if (tweet.parent) {
            newTweet.parent = resolveTweet(tweetMap.get(tweet.parent));
        }

        if (tweet.likes) {
            newTweet.likes = tweet.likes[0].count;
        }

        newTweet.interactions = newTweet.likes;

        resolved.set(tweet.id, newTweet);
        return newTweet;
    }

    const result = tweets
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(resolveTweet);

    return result;
}
