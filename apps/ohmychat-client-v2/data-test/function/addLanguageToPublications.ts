import { faker } from "@faker-js/faker";
import { Publication } from "../models";

import { User } from "../models";

const addLanguageToPublications = async () => {
    const users = await User.find();
    
    for (const user of users) {
        const publications = await Publication.find({ user: user._id });
        const lang = faker.helpers.arrayElement(['fr-FR', 'en-EN', 'en-US', 'es-ES', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW']);
        
        for (const pub of publications) {
            pub.lang = lang;
            await pub.save();
        }
        
        console.log(`Langues ajoutées pour les publications de l'utilisateur ${user.id}`);
    }
    
    console.log('Mise à jour des langues terminée');
}   