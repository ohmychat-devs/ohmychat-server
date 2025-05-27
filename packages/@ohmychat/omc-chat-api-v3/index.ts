import { createStore } from "./store/create";
import { events, io, supabase } from "@ohmychat/ohmychat-backend-core";

import './supabase/realtime';

import { observable } from "@legendapp/state";
import jwt from 'jsonwebtoken';
import { msgsSorter } from "./functions/msgsSorter";

/**
 * Point d'entrée principal du namespace WebSocket "/chat".
 * 
 * - Initialise un store par connexion client.
 * - Gère l'authentification multi-compte via tokens JWT.
 * - Permet de sélectionner le compte actif et d'écouter la liste des chats en temps réel.
 * - Nettoie les ressources à la déconnexion.
 *
 * Événements gérés :
 * - 'tokens' : Enregistre plusieurs tokens JWT pour l'utilisateur.
 * - 'currentToken' : Définit le compte actif et souscrit à la liste des chats correspondante.
 * - 'disconnect' : Nettoie les souscriptions et ressources.
 */
io.of("/chat").on("connection", async socket => {
    const store = createStore();
    const manager$ = observable<{
        activeAccountId: string | null;
        tokens: Record<string, { loaded: boolean; cleanup?: () => void }>;
    }>({
        activeAccountId: null,
        tokens: {},
    });

    let currentChatListCo;
    let currentChatBoxCo;

    socket.on('tokens', async (tokens, callback) => {
        try {
            tokens.forEach(token => {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (!decoded && !decoded?.id) return;

                const id = decoded?.id;
                if(!manager$.tokens[id].get()) manager$.tokens[id].set({ loaded: false });
            }).then(() => {
                callback(true);
            })
        } catch (error) {
            callback(false);
        }
    });

    socket.on('currentToken', async (token, callback) => {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded && !decoded?.id) return;

            if (currentChatListCo) currentChatListCo();

            const id = decoded?.id;
            manager$.activeAccountId.set(id);

            if(!manager$.tokens[id].get().loaded) {
                const cleanup = await store.init(id);
                manager$.tokens[id].set({ loaded: true, cleanup });
            }

            currentChatListCo = store.chatList$(id).onChange(({ value }) => {
                socket.emit("chatList", value);
            }, { initial: true });

            function searchInStore (query: string, date: number) {
                return events.emit('search_messages_' + id + '_' + date, query);
            }

            events.on('search_messages_' + id, searchInStore);

            callback(true);
        } catch (error) {
            callback(false);
        }
    });

    const offsets: Record<string, number> = {};

    socket.on('chatBox', async (token, chatID) => {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded && !decoded?.id) return;

        const id = decoded?.id;
        console.log("chatBox", chatID);
        socket.join(chatID);

        if (currentChatBoxCo) currentChatBoxCo();

        if(!manager$.tokens[id].get()?.loaded) {
            const cleanup = await store.init(id);
            manager$.tokens[id].set({ loaded: true, cleanup });
        }

        if (offsets[chatID] == null) offsets[chatID] = 20;

        currentChatBoxCo = store.chatBox$(chatID).onChange(async ({ value, getPrevious }) => {
            const lastMsgSeen = value?.at(-1)?.id;
            await supabase
                .from('chat_group_members')
                .update({ last_msg_seen: lastMsgSeen })
                .eq('user', manager$.activeAccountId.get())
                .eq('group', chatID);

            if (getPrevious()) {
                offsets[chatID] += value?.length - getPrevious()?.length;
            }
            socket.emit("chatBox", value?.sort(msgsSorter)?.slice(-offsets[chatID]));
        }, { initial: true });

        socket.on('chatBoxScroll', (callback) => {
            const oldOffset = offsets[chatID];
            const messages = store.chatBox$(chatID).get();
            offsets[chatID] = Math.min(offsets[chatID] + 20, messages?.length ?? offsets[chatID]);

            if (oldOffset === offsets[chatID]) return callback({ error: "No more messages" });
            //console.log("chatBoxScroll", offsets[chatID], oldOffset);
            callback(true);
            socket.emit("chatBox", messages?.sort(msgsSorter)?.slice(-offsets[chatID]));
        });

        let typingTrigger = null;

        socket.on('chatBox_typing', async (status) => {
            let source = store.sourcesByGroup$.get()[chatID];
            source = source.find(s => s.user === manager$.activeAccountId.get())?.id;

            // Déclenche l'état "typing"
            await supabase
                .from('chat_group_typing')
                .upsert({ source, status, date: new Date().toISOString() }, { onConflict: 'source' });

            if (typingTrigger) clearTimeout(typingTrigger);
            typingTrigger = setTimeout(async () => {
                // Arrete l'état "typing"
                await supabase
                    .from('chat_group_typing')
                    .upsert({ source, status: null, date: new Date().toISOString() }, { onConflict: 'source' });

                typingTrigger = null;
            }, 1000)
        });

        socket.on('chatBox_input', async ({ text, parent, id, status = "active" }: { text: string; parent?: string; id?: string, status?: string }) => {
            let source = store.sourcesByGroup$.get()[chatID];
            source = source.find(s => s.user === manager$.activeAccountId.get())?.id;

            console.log("chatBox_input", text, source);

            const { data, error } = await supabase
                .from('chat_group_messages')
                .upsert({ source, text, parent, id, status }, { onConflict: 'id' })
                .select()

            if (error) {
                console.error(error);
                return;
            }
            // Si un nouveau message est ajouté, offset sera augmenté automatiquement dans onChange
        });
    });

    socket.on('chatBoxLeave', (id) => {
        console.log("chatBoxLeave", id);
        if (currentChatBoxCo) currentChatBoxCo();

        socket.leave(id);
    });

    socket.on('disconnect', () => {
        if (currentChatListCo) currentChatListCo();

        manager$.activeAccountId.set(null);

        for (const { cleanup } of Object.values(manager$?.tokens?.get()) as { cleanup?: () => void }[]) {
            if(cleanup) cleanup();
        }
    });
});