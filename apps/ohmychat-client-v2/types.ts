import { Observable } from "@legendapp/state";

export type Group = {
    id: string,
    name: string | null,
    created_at: string,
    created_by: string
    avatar: string
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

export type StoreObj = {
    tokens: string[] | null;
    currentToken: string | null;
    chat: {
        loaded: { [key: string]: boolean; };
        groups$: Group[];
        members$: Member[];
        typing$: Typing[];
        messages$: Message[];
        chatList$: (token: Observable<string|null>) => Observable<[string, number]>;
    }
    users$: {
        [key: string]: {
            id: string;
            displayname: string;
            username: string;
            avatar: string;
        }
    }
}

export type Store = StoreObj | Observable<StoreObj>;

export type Sync = (...args: any[]) => void;