import { supabase } from '@ohmychat/ohmychat-backend-core';

export async function getFollowings(decoded: any, store: any) {
    const { data } = await supabase
        .from('relations')
        .select('*')
        .eq('status', 'follow')
        .eq('source', decoded.id);

    if (data) store.relations.set(existing => {
        const relationsMap = new Map([...existing, ...data].map((relation) => [relation.id, relation]));
        return Array.from(relationsMap.values());
    });
}
