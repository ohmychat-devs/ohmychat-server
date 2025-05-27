import { io, supabase } from '@ohmychat/ohmychat-backend-core';
import { relationsChanges, likesChanges } from './changes';
import { initSwayClient } from './initSwayClient';
import { createStore } from './createStore';
import { onDisconnect } from './onDisconnect';

supabase.channel('ohmychat-realtime-sway')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'relations' }, relationsChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'relations' }, relationsChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'sway_likes' }, likesChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sway_likes' }, likesChanges)
    .subscribe();

io.of('/sway').on('connection', (socket) => {
    try {
        const { store, sync } = createStore();
        initSwayClient(socket, store, sync);
        onDisconnect(socket, store);
    } catch (error) {
        console.error(error);
    }
});