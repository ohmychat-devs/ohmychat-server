type Tweet = {
    id: string;
    content: string;
    authorId: string;
    timestamp: Date;
    likes: { count: number; }[];
};
type Like = {
    id: string;
    userId: string;
    tweetId: string;
    status: 'active' | null;
};
type Relation = {
    id: string;
    source: string;
    target: string;
    status: 'active' | 'inactive';
};
type User = {
    id: string;
    username: string;
    displayname: string;
};

export type Store = {
    tweets: Tweet[];
    users: User[];
    likes: Like[];
    relations: Relation[];
    emitters: Function[];
};
