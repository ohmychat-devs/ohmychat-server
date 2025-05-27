import { observe } from "@legendapp/state";
import { events } from "@ohmychat/ohmychat-backend-core";
import { idFromToken, verifyToken } from "./tokens";

export function syncEvents ({ socket, store, sync }) {
    const activeHandlers = new Map<string, () => void>();
    observe(store.tokens, ({ value: newTokens, previous: oldTokens }) => {
        try {
            const oldSet = new Set<string>(oldTokens || []);
            const newSet = new Set<string>(newTokens || []);
        
            for (const token of oldSet) {
                if (!newSet.has(token)) {
                    const id = idFromToken(token);
                    events.off(id, sync);
                    activeHandlers.delete(id);
                }
            }
        
            for (const token of newSet) {
                if (!oldSet.has(token)) {
                    if (!verifyToken(token, socket)) continue;
                    const id = idFromToken(token);
                    events.on(id, sync);
                    activeHandlers.set(id, sync);
                }
            }
        } catch (error) {
            console.error(error);
        }
    });
}
