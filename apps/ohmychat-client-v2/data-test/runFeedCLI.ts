import readline from 'readline';
export const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
import inquirer from 'inquirer';
import { generateFeed } from './generateFeed';
import { pushInteraction } from './function/pushInteraction';
import fs from 'fs';
import { User } from './models';
import { createPublications } from './function/createPublications';

export async function runFeedCLI() {
    const userId = fs.readFileSync('userId.txt', 'utf8');
    let user = await User.findOne({ id: userId });

    if (!user) {
        console.log('⚠️ Utilisateur non trouvé.');
        user = await User.create({ id: userId });
    }

    while (true) {
        await createPublications();
        const feed = await generateFeed(['story', 'flick']);
        console.log(feed.map(f => f.themes));

        if (!feed || feed.length === 0) {
            console.log('⚠️ Aucun contenu disponible pour le moment.');
            continue;
        }

        for (let i = 0; i < feed.length; i++) {
            const publication = feed[i];
            await pushInteraction(user?._id, publication._id, 'view');

            console.log(`\n📄 Publication ${i + 1}/${feed.length}`);
            console.log(`🔢 ID : ${publication._id}`);
            console.log(`🔢 Score : ${publication.score}`);
            console.log(`🌐 Langue : ${publication.lang}`);
            console.log(`🏷️ Thèmes : ${publication.themes?.join(', ')}`);
            console.log(`📦 Type : ${publication.type}`);
            console.log(`👀 Déjà vu : ${publication.isViewed}`);
            console.log(`👍 Déjà likée : ${publication.isLiked}`);
            console.log('------------------------');

            let next = false;

            while (!next) {
                const { action } = await inquirer.prompt([
                    {
                        type: 'list',
                        name: 'action',
                        message: 'Choisis une action :',
                        choices: [
                            { name: '➡️  Suivant', value: 'next' },
                            { name: '⬅️  Précédent', value: 'prev' },
                            { name: '👍 Like', value: 'like' },
                            { name: '💬 Commenter', value: 'comment' },
                            { name: '⭐ Sauvegarder', value: 'save' },
                            { name: '👋 Quitter', value: 'quit' },
                        ]
                    }
                ]);

                switch (action) {
                    case 'like':
                        await pushInteraction(user?._id, publication._id, 'like');
                        console.log('👍 Publication likée !');
                        break;
                    case 'comment':
                        const { comment } = await inquirer.prompt([
                            {
                                type: 'input',
                                name: 'comment',
                                message: '💬 Ton commentaire :'
                            }
                        ]);
                        await pushInteraction(user?._id, publication._id, 'comment', comment);
                        console.log(`🗨️ Commentaire reçu : "${comment}"`);
                        break;
                    case 'save':
                        await pushInteraction(user?._id, publication._id, 'save');
                        console.log('⭐ Publication sauvegardée !');
                        break;
                    case 'next':
                        next = true;
                        break;
                    case 'prev':
                        if (i > 0) {
                            i--;
                        }
                        next = true;
                        break;
                    case 'quit':
                        console.log('👋 Fin du programme. À bientôt !');
                        process.exit(0);
                }
            }
        }

        console.log('\n🔁 Génération automatique d\'un nouveau feed...\n');
    }
}