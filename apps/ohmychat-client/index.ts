import { server } from "@ohmychat/ohmychat-backend-core";

import "@ohmychat/ohmychat-chat-api-v3";
import "@ohmychat/ohmychat-auth-api";
import "@ohmychat/ohmychat-search-api";
import "@ohmychat/ohmychat-relations-api";
import "@ohmychat/ohmychat-users-api";
import "@ohmychat/ohmychat-stories-api";
import "@ohmychat/ohmychat-sway-api";
import "@ohmychat/ohmychat-apps-api";
import "@ohmychat/ohmychat-files";
import "@ohmychat/ohmychat-views";

import { observable } from "@legendapp/state";
import jwt from "jsonwebtoken";
import { io, supabase } from "@ohmychat/ohmychat-backend-core";

io.of('/relations').on('connection', (socket) => {
    const store = observable({
        tokens: {},
        current: null,
        relations: [],
        activeRelations: () => [
            Object.groupBy(store.relations.get(), relation => relation.source)[store.current.get()],
            Object.groupBy(store.relations.get(), relation => relation.target)[store.current.get()],
        ].flat().filter(Boolean)
    });

    const unsubscribe = store.activeRelations.onChange(({ value: currentRelations }) => {
        console.log(currentRelations);
    }, { immediate: true, initial: true });

    socket.on('currentToken', async (token, callback) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded && !decoded?.id) return;

            store.current.set(decoded?.id);
            callback(true);
        } catch (error) {
            callback(false);
        }
    })

    socket.on('tokens', async (tokens, callback) => {
        try {
            const ids = tokens.map(token => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (!decoded && !decoded?.id) return;

                const id = decoded?.id;
                if(!store.tokens[id].get()) {
                    store.tokens[id].set({ loaded: true });
                }

                return id;
            }).filter(Boolean);

            const { data: relations, error } = await supabase.from('relations').select('*').or(`source.in.(${ids}),target.in.(${ids})`);

            store.relations.set(relations);
            callback(true);
        } catch (error) {
            callback(false);
        }
    })

    socket.on('followBtn', (id) => {
        socket.emit('followBtn_'+id, id);
        
        socket.on('followBtn_'+id+"_unsubscribe", () => {
            unsubscribe();
        });
    })

    socket.on('disconnect', () => {
        unsubscribe();
    });
});

const port = process.env.PORT || 80;
server.listen(port, async () => {
    console.log(`Listening on port ${port}`);
});