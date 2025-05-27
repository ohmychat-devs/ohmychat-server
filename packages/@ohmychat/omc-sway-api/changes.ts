import { emitter } from './emitter';

export const relationsChanges = (payload) => {
    if (!payload.new) return;
    emitter.emit('incoming_' + payload.new.source, "relation", payload.new);
};
export const likesChanges = (payload) => {
    if (!payload.new) return;
    emitter.emit('incoming_' + payload.new.source, "like", payload.new);
};
