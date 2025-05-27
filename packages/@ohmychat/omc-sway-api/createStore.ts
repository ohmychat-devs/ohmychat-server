import { observable } from '@legendapp/state';
import { Store } from './types';

export function createStore() {
    const store = observable<Store>({
        tweets: [],
        users: [],
        likes: [],
        relations: [],
        emitters: <Function[]>[]
    });

    const sync = (type, payload) => {
        switch (type) {
            case 'relation':
                store.relations.set(existing => {
                    const relationsMap = new Map([...existing, payload].map((relation) => [relation.id, relation]));
                    return Array.from(relationsMap.values());
                });
                break;

            case 'like':
                store.likes.set(existing => {
                    const likesMap = new Map([...existing, payload].map(({ id, ...obj }) => [id, { id, ...obj }]));
                    return Array.from(likesMap.values());
                });
                store.tweets.find(({ id }) => id.get() === payload.tweet)?.likes.set(likes => [{ count: likes[0].count + (payload.status === 'active' ? 1 : -1) }]);
                break;
            default:
                break;
        }
    };

    return { store, sync };
}