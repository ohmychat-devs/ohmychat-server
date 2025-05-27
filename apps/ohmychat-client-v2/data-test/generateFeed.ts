import fs from 'fs';
import { storyFilter } from './function/storyFilter';
import { User, Publication } from './models';
import { langFilter } from './function/langFilter';
import { addWeight } from './function/addWeight';
import { updateUserFavoriteThemesAndLangs } from './function/updateUserFavoriteThemesAndLangs';

export const generateFeed = async (types: string | string[]) => {
    const userId = fs.readFileSync('userId.txt', 'utf8');
    const user = await updateUserFavoriteThemesAndLangs(userId);

    if (!user) {
        console.error('Utilisateur non trouvé');
        return;
    }

    const typeCondition = Array.isArray(types)
        ? { type: { $in: types } }
        : { type: types };

    const query = {
        $and: [
            typeCondition,
            langFilter(user?.langs),
            ...storyFilter(types)
        ]
    };

    const publications = await Publication.find(query);
    const uniqueLanguages = [...new Set(publications.map(pub => pub.lang))];

    console.log(`Publications trouvées pour l'utilisateur ${userId} :`, publications.length);
    console.log('Langues des publications:', uniqueLanguages);

    // Map user tags par tag => poids pour accès rapide
    const weightedPublications = await addWeight(user, publications);
    return weightedPublications//.sort(() => Math.random() - 0.75);
};
