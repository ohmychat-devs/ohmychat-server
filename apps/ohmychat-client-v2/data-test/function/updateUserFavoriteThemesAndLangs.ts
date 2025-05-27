import { User } from '../models';
import { Publication } from '../models';
import { Interaction } from '../models';

const INTERACTION_WEIGHTS = {
    view: 0.5,
    like: 1.5,
    comment: 3,
    save: 2,
    share: 3.5,
    report: -5
  };
  
export async function updateUserFavoriteThemesAndLangs(userId: string) {
    // Récupérer les interactions de l'utilisateur avec les Flicks (publications)
    const user = await User.findOne({ id: userId });
    const interactions = await Interaction.find({ user: user?._id }).populate('publication');
  
    // Fréquence globale des thèmes (pour la rareté)
    const allFlicks = await Publication.find({}, { "themes": 1, lang: 1 }).lean();
    
    const themeGlobalFrequency: Record<string, number> = {};
    const langGlobalFrequency: Record<string, number> = {};
    
    for (const flick of allFlicks) {
      const themes = flick.themes || [];
      for (const theme of themes) {
        themeGlobalFrequency[theme] = (themeGlobalFrequency[theme] || 0) + 1;
      }
      if (flick.lang) {
        langGlobalFrequency[flick.lang] = (langGlobalFrequency[flick.lang] || 0) + 1;
      }
    }
    
    const totalFlicks = allFlicks.length;
  
    // Récupérer la liste des utilisateurs suivis pour ajuster les scores
    //const followRelations = await Relation.find({ user: userId, type: "follow" }).lean();
    //const followedUserIds = new Set(followRelations.map(rel => rel.target.toString()));
  
    // Scores cumulés
    const themeScores: Record<string, number> = {};
    const langScores: Record<string, number> = {};
  
    for (const { type, publication } of interactions) {
      let baseWeight = INTERACTION_WEIGHTS[type] ?? 0;
  
      if (baseWeight === 0) continue; // interaction inconnue ou non pondérée
  
      //const isAuthorFollowed = followedUserIds.has(flick.user.toString());
      //const followFactor = isAuthorFollowed ? 1.5 : 1;
  
      // Gestion spécifique des vues avec durée
      if (type === "view") {
        //const viewDuration = getInteractionDurationSeconds({ startDate, endDate });
        //const totalVideoDuration = getTotalFlickVideoDuration(flick);
        //if (totalVideoDuration > 0) {
        //  const completionFactor = Math.min(1, Math.max(0.1, viewDuration / totalVideoDuration));
        //  baseWeight *= completionFactor;
        //} else {
        //  baseWeight *= 0.5;
        //}
      }
  
      const themes = publication?.themes || [];
      //const recencyBonus = getRecencyBonus(createdAt);
  
      for (const theme of themes) {
        const rarityBonus = themeGlobalFrequency[theme]
          ? Math.log(1 + totalFlicks / themeGlobalFrequency[theme])
          : 1.5;
  
        const currentThemeScore = themeScores[theme] || 0;
        const explorationBonus = currentThemeScore < 3 ? 1.3 : 1;
        const saturationFactor = 1 / Math.sqrt(1 + currentThemeScore);
  
        const totalScore =
          baseWeight *
          //recencyBonus *
          rarityBonus *
          explorationBonus *
          saturationFactor;
          //followFactor;
  
        themeScores[theme] = currentThemeScore + totalScore;
      }
  
      // Calcul du score pour la langue
      if (publication.lang) {
        const currentLangScore = langScores[publication.lang] || 0;
        const rarityLangBonus = langGlobalFrequency[publication.lang]
          ? Math.log(1 + totalFlicks / langGlobalFrequency[publication.lang])
          : 1.5;
  
        const saturationLangFactor = 1 / Math.sqrt(1 + currentLangScore);
  
        const totalLangScore =
          baseWeight *
          //recencyBonus *
          rarityLangBonus *
          saturationLangFactor;
          //followFactor;
  
        langScores[publication.lang] = currentLangScore + totalLangScore;
      }
    }
  
    // Normalisation des scores avant tri
    const normalizedThemeScores = normalizeScores(themeScores);
    const normalizedLangScores = normalizeScores(langScores);

    // Trier & garder top 10 (sur scores normalisés)
    const favoriteThemes = Object.fromEntries(
        Object.entries(normalizedThemeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    );

    const favoriteLangs = Object.fromEntries(
        Object.entries(normalizedLangScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    );

    // Mise à jour User
    const updatedUser = await User.findByIdAndUpdate(
        user?._id,
        {
            tags: Object.entries(favoriteThemes).map(([theme, weight]) => ({ tag: theme, weight })),
            langs: Object.entries(favoriteLangs).map(([lang, weight]) => ({ lang, weight }))
        },
        { new: true }
    );

    return updatedUser;
}

function normalizeScores(scores: Record<string, number>) {
    const maxScore = Math.max(...Object.values(scores), 1); // éviter division par 0
    const normalized: Record<string, number> = {};
    for (const [key, score] of Object.entries(scores)) {
      normalized[key] = score / maxScore;
    }
    return normalized;
}