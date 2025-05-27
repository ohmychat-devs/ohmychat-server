import { User } from "../models";
import { Publication } from "../models";
import { faker } from "@faker-js/faker";

export const createPublications = async () => {
    const users = await User.find();
    
    for (const user of users) {
        const numPubs = faker.number.int({ min: 1, max: 5 });
        
        for (let i = 0; i < numPubs; i++) {
            const pub = new Publication({
                id: faker.string.uuid(),
                ...faker.helpers.arrayElement([
                    {
                        type: 'sway',
                        mediaTypes: faker.helpers.arrayElements(['text', faker.helpers.arrayElement(['image', 'video'])]),
                    },
                    {
                        type: 'flick',
                        mediaTypes: faker.helpers.arrayElements(['image', 'video']),
                    },
                    {
                        type: 'story',
                        mediaTypes: faker.helpers.arrayElement(['image', 'video']),
                    }
                ]),
                themes: faker.helpers.arrayElements(['sport', 'music', 'food', 'travel', 'tech'], { min: 1, max: 3 }),
                lang: 'fr-FR', //faker.helpers.arrayElement(['fr-FR', 'fr-CA', 'fr-BE', 'en-EN', 'en-US', 'es-ES', 'es-MX', 'es-AR', 'es-CO', 'de-DE', 'it-IT', 'ja-JP', 'ko-KR', 'zh-CN', 'zh-TW']),
                user: user._id
            });
            
            await pub.save();
        }
    }
    
    console.log("Publications créées avec succès");
}