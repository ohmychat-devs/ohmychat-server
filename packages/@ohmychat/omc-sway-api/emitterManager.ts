import { emitter } from './emitter';

export function emitterManager(decoded: any, realtime: any, store: any) {
    emitter.on('incoming_' + decoded.id, realtime);
    store.emitters.set(existing => [...existing, () => {
        emitter.off('incoming_' + decoded.id, realtime);
    }]);
}
