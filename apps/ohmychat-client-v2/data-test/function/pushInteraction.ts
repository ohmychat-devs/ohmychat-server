import mongoose from 'mongoose';
import { Interaction } from '../models';

export const pushInteraction = async (user: string, publication: string, type: string, content?: string) => {
    try {
        const interaction = new Interaction({
            user,
            publication, 
            type,
            content,
        });

        await interaction.save();
        console.log(`✅ Interaction ${type} enregistrée avec succès`);
    } catch (error) {
        console.error(`❌ Erreur lors de l'enregistrement de l'interaction:`, error);
    }
};
