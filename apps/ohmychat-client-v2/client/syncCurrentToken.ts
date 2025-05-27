import { Observable, observe } from "@legendapp/state";
import fs from "fs";

export const syncCurrentToken = (currentToken: Observable<string|null>) => {
    try {
        const cachedToken = fs.existsSync('./client/cache.json') 
            ? JSON.parse(fs.readFileSync('./client/cache.json', 'utf8') ?? "{}").currentToken
            : null;
        currentToken.set(cachedToken);
    } catch (err) {
        console.error('Erreur lors du chargement du cache:', err);
    }

    observe(currentToken, ({ value: newState }) => {
        fs.writeFileSync('./client/cache.json', JSON.stringify({ ...JSON.parse(fs.readFileSync('./client/cache.json', 'utf8') ?? "{}"), currentToken: newState }));
    });
}