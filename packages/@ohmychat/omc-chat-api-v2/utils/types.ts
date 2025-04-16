export type Group = {
    id: string,
    name: string | null,
    created_at: string,
    created_by: string
}

export type Member = {
    id: string,
    user: string,
    group: string,
    last_msg_seen: string
}

export type Typing = {
    id: string,
    user: string,
    group: string,
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