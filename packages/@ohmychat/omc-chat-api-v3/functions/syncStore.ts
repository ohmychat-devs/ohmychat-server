import { eventEmitter } from "../events/emitter";
import { Member, Group, Typing, Message } from "../types";

export const syncStore = async ({members$, groups$, typing$, messages$, users$}, id) => {
    function updateListById(prevList, payload) {
        const map = new Map(prevList.map(item => [item.id, item]));
        map.set(payload.id, payload);
        return [...map.values()];
    }
    
    function updateRecordById(prevRecord, payload) {
        return { ...prevRecord, [payload.id]: payload };
    }

    const handler = (type, payload) => {
        switch (type) {
            case 'message':
                messages$.set(prev => updateListById(prev, payload) as Message[]);
                break;
    
            case 'member':
                members$.set(prev => updateListById(prev, payload) as Member[]);
                break;
    
            case 'typing':
                typing$.set(prev => updateListById(prev, payload) as Typing[]);
                break;
    
            case 'user':
                users$.set(prev => updateRecordById(prev, payload));
                break;
    
            case 'group':
                groups$.set(prev => updateListById(prev, payload) as Group[]);
                break;
    
            default:
                break;
        }
    }

    eventEmitter.on('incoming_'+id, handler);

    return {
        off: () => eventEmitter.off('incoming_'+id, handler)
    }
};