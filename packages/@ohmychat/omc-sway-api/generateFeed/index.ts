import { retrieveFeed } from '../retrieveFeed';
import { getTweets } from './getTweets';
import { getRecentLikes } from './getRecentLikes';
import { getFollowings } from './getFollowings';

export async function generateFeed(decoded: any, store: any, callback: any) {
    await getFollowings(decoded, store);
    await getTweets(decoded, store, await getRecentLikes(decoded, store));

    callback(retrieveFeed(store));
}