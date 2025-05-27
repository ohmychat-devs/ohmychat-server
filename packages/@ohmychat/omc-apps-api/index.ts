import { observable } from "@legendapp/state";
import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import jwt from "jsonwebtoken";
import { EventEmitter } from "eventemitter3";
import { verifyToken } from "@ohmychat/ohmychat-auth-api";

const emitter = new EventEmitter();

function appsChanges(payload) {
    const loggedUsers = emitter.eventNames();
    loggedUsers.forEach(event => emitter.emit(event, 'app', payload.new));
}
function authorsChanges(payload) {
    const loggedUsers = emitter.eventNames();
    loggedUsers.forEach(event => emitter.emit(event, 'author', payload.new));
}
function appsByUsersChanges(payload) {
    emitter.emit("user:"+payload.new.user, 'appByUsers', payload.new);
}

supabase
    .channel("ohmychat-realtime-apps")
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'apps' }, appsChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'apps' }, appsChanges)
    //.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_authors' }, authorsChanges)
    //.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_authors' }, authorsChanges)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'apps_users' }, appsByUsersChanges)
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'apps_users' }, appsByUsersChanges)
    .subscribe();

io.of('/apps').on('connection', (socket) => {
    const appsMetaData$ = observable({});
    const authorsMetaData$ = observable({});
    const appsByUsers$ = observable<{ user: string; app: string }[]>([]);

    const loadedUsers$ = observable<Record<string, boolean>>({});
    const activeUser$ = observable<string | null>(null);
    const activeApps$ = observable(() => appsByUsers$.get()?.filter(({ user }) => user === activeUser$.get()));

    const handleIncomingApps = (type, data) => {
        switch (type) {
            case 'appByUsers':
                appsByUsers$.set(existing => Object.values([...existing, data]?.reduce((acc, val) => {
                    acc[val?.id] = { ...val, app: val?.app?.id ?? val?.app };
                    return acc;
                }, {})));
                break;
            
            case 'app':
                appsMetaData$[data.id].set(data);
                break;

            case 'author':
                authorsMetaData$[data.id].set(data);
                break;
        
            default:
                break;
        }
    }

    loadedUsers$.onChange(({ value: loadedUsers, getPrevious }) => {
        try {
            const previous = getPrevious();
            if (previous) Object.keys(previous).forEach(user => emitter.off(`user:${user}`, handleIncomingApps));
            if (loadedUsers) Object.keys(loadedUsers).forEach(user => emitter.on(`user:${user}`, handleIncomingApps))
        } catch (error) {
            console.error(error);
        }
    }, { initial: true });

    socket.on('activeUser', async (token) => {
        const user = await verifyToken(token);

        if(Object.keys(loadedUsers$.get()).length === 0) supabase
            .from('apps')
            .select('*, author(*)')
            .then(({ data, error }) => {
                if (!data || error) return;
                data?.forEach(app => {
                    appsMetaData$[app.id].set({ ...app, author: app.author.id });
                    authorsMetaData$[app.author.id].set(app.author);
                });
            });

        if (!loadedUsers$[user].get()) {
            supabase.from('apps_users').select('*').eq('user', user).eq('active', true).then(({ data, error }) => {
                if (!data || error) return;
                appsByUsers$.set(existing => Object.values([...existing, ...data]?.reduce((acc, val) => {
                    acc[val?.id] = val;
                    return acc;
                }, {})));

                loadedUsers$[user].set(true);
            })
        }
        activeUser$.set(user);
    });

    appsMetaData$.onChange(({ value: apps }) => {
        authorsMetaData$.onChange(({ value: authors }) => {
            if(!apps || !authors) return;
    
            socket.emit('apps', Object.fromEntries(Object.entries(apps)?.map(([id, app]) => {
                return [id, { ...app, author: authors[app?.author] }];
            })));
            
            activeApps$.onChange(({ value: activeApps }) => {
                if(activeApps) socket.emit('activeApps', activeApps.filter(({ active }) => active).map(({ app }) => apps[app]?.name));
            }, { initial: true });
        }, { initial: true });
    }, { initial: true });

    socket.on('disconnect', () => {
        activeUser$.set(null);
        const users = Object.keys(loadedUsers$.get());
        users.forEach(user => emitter.off(`user:${user}`, handleIncomingApps));
    });
});