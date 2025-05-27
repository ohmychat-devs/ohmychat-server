import { Observable } from "@legendapp/state";
import { observe } from "@legendapp/state";
import fs from "fs";

export  function syncTokens(clientTokens: Observable<string[]>) {
    try {
        const cachedTokens = fs.existsSync('./client/cache.json') 
            ? JSON.parse(fs.readFileSync('./client/cache.json', 'utf8') ?? "{}").tokens
            : [];
        clientTokens.set(cachedTokens);
    } catch (err) {
        console.error('Erreur lors du chargement du cache:', err);
    }
    
    observe(clientTokens, ({ value: tokens }) => {
        try {
            fs.writeFileSync('./client/cache.json', JSON.stringify({ ...JSON.parse(fs.readFileSync('./client/cache.json', 'utf8') ?? "{}"), tokens }));
        } catch (err) {
            console.error('Erreur lors de la sauvegarde du cache:', err);
        }
    });
}
