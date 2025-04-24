export type Group = {
    id: string,
    name: string | null,
    created_at: string,
    created_by: string
}

export type GroupWithMembers = {
    id: string,
    name: string | null,
    created_at: string,
    created_by: string,
    members: any[]
}

export type Member = {
    id: string,
    user: string,
    group: string,
    last_msg_seen: string;
    status: string;
}

export type Typing = {
    id: string,
    source: string,
    status: string | null,
    created_at: string
}

export type Message = {
    id: string,
    text: string,
    parent: null,
    source: string,
    status: string,
    typed_at: string,
    created_at: string,
    published_at: string
}

export type User = {
    id: string,
    date: string,
    admin: boolean,
    email: string,
    active: boolean,
    username: string,
    verified: boolean,
    displayname: string
}

export type InitChatData = {
    group: {
        id: string,
        name: string | null,
        created_at: string,
        created_by: string,
        members: {
            id: string,
            user: string,
            userData: User,
            group: string,
            last_msg_seen: string,
            typing: Typing,
            messages: Message[]
        }[]
    }
}[]

export type FetchedChat = {
    groups: Group[],
    members: Member[],
    typing: Typing[],
    messages: Message[],
    users: User[]
}

export type ChatStore = {
    channels?: Record<string, Group>;
    sources?: Record<string, Member>;
    users?: Record<string, User>;
    typing?: Record<string, Typing>;
    messages?: Record<string, Message>;
    loadedUsers?: Record<string, boolean>;
};

export type UserChatData = {
    groups: Group[];
    members: Member[];
    users: Record<string, User>;
    messages: Message[];
    typing: Typing[];
    messagesByGroup: Record<string, Message[]>;
}

export type ChatStoreObservables = {
    members$: Observable<Member[]>,
    groups$: Observable<Group[]>,
    typing$: Observable<Typing[]>,
    messages$: Observable<Message[]>,
    users$: Observable<User[]>,
    sourcesByUser$: Observable<Record<string, Member[]>>,
    sourcesByGroup$: Observable<Record<string, Member[]>>,
    sourcesByID$: Observable<Record<string, Member>>,
    groupsByID$: Observable<Record<string, Group>>,
    groupsByUsers$: Observable<Record<string, Group[]>>,
    typingByGroups$: Observable<Record<string, Typing[]>>,
    messagesByGroup$: Observable<Record<string, Message[]>>
}
