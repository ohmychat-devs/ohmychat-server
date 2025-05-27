export function onDisconnect(socket, store) {
    socket.on('disconnect', () => {
        console.log('sway disconnected');
        store.emitters.get().forEach((cleanup) => cleanup());
    });
}
