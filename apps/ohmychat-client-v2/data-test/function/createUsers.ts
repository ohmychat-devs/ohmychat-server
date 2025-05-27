import { User } from "../models";
import { faker } from "@faker-js/faker";

export const createUsers = async () => {
    try {
        for(let i = 0; i < 10; i++) {
            const userThemes = [];
            // Attribution de 1 à 3 thèmes aléatoires pour chaque utilisateur
            const numThemes = Math.floor(Math.random() * 3) + 1;
            
            for(let j = 0; j < numThemes; j++) {
                userThemes.push({
                    theme: themes[Math.floor(Math.random() * themes.length)],
                    weight: Math.random()
                });
            }

            const user = new User({
                id: faker.string.uuid(),
                themes: userThemes
            });

            await user.save();
            console.log(`Utilisateur créé avec ID: ${user.id}`);
        }
        
        console.log('Création des utilisateurs terminée');
        
    } catch (error) {
        console.error('Erreur lors de la création des utilisateurs:', error);
    }
};