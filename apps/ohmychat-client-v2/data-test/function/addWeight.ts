import { Interaction } from "../models";

export async function addWeight(user, publications, langWeightFactor = 0.3, tagsWeightFactor = 0.7) {
    const userTagWeights = new Map(user.tags.map(t => [t.tag, t.weight]));

    const publicationIds = publications.map(p => p._id?.toString() || p.id).filter(Boolean);

    // Récupération des interactions de type view ou like
    const interactions = await Interaction.find({
        user: user._id,
        type: { $in: ['view', 'like'] },
        publication: { $in: publicationIds }
    }).select('publication type').lean();

    // Sets d'interactions
    const seenIds = new Set();
    const likedIds = new Set();
    for (const { publication, type } of interactions) {
        const id = publication.toString();
        if (type === 'view') seenIds.add(id);
        if (type === 'like') likedIds.add(id);
    }

    const weightedPublications = publications.map(pub => {
        const pubId = pub._id?.toString() || pub.id;

        const isViewed = seenIds.has(pubId);
        const isLiked = likedIds.has(pubId);

        // Langue
        const userLang = user.langs.find(l => pub.lang?.startsWith(l.lang));
        const langWeight = userLang?.weight ?? 0;

        // Tags
        const pubTags = pub?.themes?.map(t => (typeof t === 'string' ? t : t.tag)) || [];
        const tagsWeightSum = pubTags.reduce((sum, tag) => {
            const w = userTagWeights.get(tag) ?? 0;
            return sum + w;
        }, 0);
        const avgTagsWeight = pubTags.length > 0 ? tagsWeightSum / pubTags.length : 0;

        // Score pondéré
        let totalScore = (langWeight * langWeightFactor) + (avgTagsWeight * tagsWeightFactor);

        // Pénalisation si déjà vu ou liké
        if (isViewed || isLiked) {
            totalScore *= 0.1;
        }

        return {
            ...pub.toObject(),
            score: totalScore,
            isViewed,
            isLiked
        };
    });

    // Normalisation
    const maxScore = Math.max(...weightedPublications.map(p => p.score), 1);
    weightedPublications.forEach(pub => {
        pub.score = pub.score / maxScore;
    });

    // Tri décroissant
    weightedPublications.sort((a, b) => b.score - a.score);
    return weightedPublications;
}