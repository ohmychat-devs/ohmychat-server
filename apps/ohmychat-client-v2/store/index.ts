import { observable } from "@legendapp/state";
import { Message, Member, Group, Typing, Store } from "../types";
import { chatStore } from "../chat";

function updateListById(prevList, payload) {
    const map = new Map(prevList.map(item => [item.id, item]));
    map.set(payload.id, payload);
    return [...map.values()];
}

function updateRecordById(prevRecord, payload) {
    return { ...prevRecord, [payload.id]: payload };
}

export const createStore = () => {
    const store = observable<Store>(() => ({
        tokens: null,
        currentToken: null,
        chat: chatStore(store)
    }));

    const sync = (type, payload) => {
        switch (type) {
            case 'message':
                store.chat.messages$.set(prev => updateListById(prev, payload) as Message[]);
                break;
    
            case 'member':
                store.chat.members$.set(prev => updateListById(prev, payload) as Member[]);
                break;
    
            case 'typing':
                store.chat.typing$.set(prev => updateListById(prev, payload) as Typing[]);
                break;
    
            case 'user':
                store.users$.set(prev => updateRecordById(prev, payload));
                break;
    
            case 'group':
                store.chat.groups$.set(prev => updateListById(prev, payload) as Group[]);
                break;
    
            default:
                break;
        }
    }

    return { store, sync };
}
