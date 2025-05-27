import { faker, fakerFR } from "@faker-js/faker";
import mongoose from "mongoose";

const db = "mongodb+srv://ohmychatdev:WdDMSc7atiJp8QHT@omc-app.xefiuow.mongodb.net/omc-db?retryWrites=true&w=majority&appName=omc-app"

mongoose.connect(db, { dbName: "omc-db" }).then(() => {
    console.log("Connected to MongoDB");
});

const User = mongoose.model("User", new mongoose.Schema({
    username: { type: String, required: true },
    avatar: { type: String },
    displayname: { type: String },
    favoriteThemes: { type: Object }
}));

const Flick = mongoose.model("Flick", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    analysis: {
        description: { type: String },
        themes: { type: [String] },
        processing_time: { type: Number },
    },
    item: { type: [
        {
            isVideo: { type: Boolean },
            duration: { type: Number }
        }
    ] }
}));

const FlickInteraction = mongoose.model("FlickInteraction", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    flick: { type: mongoose.Schema.Types.ObjectId, ref: "Flick", required: true },
    type: {
      type: String,
      enum: ["view", "like", "save", "repost", "comment"],
      required: true
    },
    startDate: { type: Date }, // date début interaction (ex: début lecture vidéo)
    endDate: { type: Date },   // date fin interaction (ex: fin lecture vidéo)
    createdAt: { type: Date, default: Date.now }
}));



const INTERACTION_WEIGHTS = {
    view: 1,
    like: 4,
    save: 5,
    repost: 7,
    comment: 12
  };
  
  function getRecencyBonus(date) {
    const daysAgo = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysAgo / 15); // demi-vie de 15 jours
  }

  function getInteractionDurationSeconds(interaction) {
    if (interaction.startDate && interaction.endDate) {
      return (interaction.endDate.getTime() - interaction.startDate.getTime()) / 1000;
    }
    return 0;
  }
  
  function getTotalFlickVideoDuration(flick) {
    if (!Array.isArray(flick.item)) return 0;
    return flick.item
      .filter(el => el.isVideo)
      .reduce((sum, el) => sum + (el.duration || 0), 0);
  }

const Relation = mongoose.model("Relation", new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    target: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["follow", "block"], required: true },
    createdAt: { type: Date, default: Date.now }
}));
  
async function updateUserFavoriteThemes(userId) {
    const interactions = await FlickInteraction.find({ user: userId }).populate("flick");
  
    const themeScores = {};
    const themeGlobalFrequency = {};
  
    // Étape 1 : fréquence globale pour la rareté
    const allFlicks = await Flick.find({}, { "analysis.themes": 1 }).lean();
    for (const flick of allFlicks) {
      const themes = flick.analysis?.themes || [];
      for (const theme of themes) {
        themeGlobalFrequency[theme] = (themeGlobalFrequency[theme] || 0) + 1;
      }
    }
    const totalFlicks = allFlicks.length;

    const followRelations = await Relation.find({ user: userId, type: "follow" }).lean();
    const followedUserIds = new Set(followRelations.map(rel => rel.target.toString()));
  
    // Étape 2 : scorer les thèmes
    for (const { type, flick, createdAt, startDate, endDate } of interactions) {
        let baseWeight = INTERACTION_WEIGHTS[type] || 0;

        const isAuthorFollowed = followedUserIds.has(flick.user.toString());
        const followFactor = isAuthorFollowed ? 1.5 : 1; // ajustable
      
        // Si c'est une vue, pondération par durée
        if (type === "view") {
            const viewDuration = getInteractionDurationSeconds({ startDate, endDate });
            const totalVideoDuration = getTotalFlickVideoDuration(flick);
            
            if (totalVideoDuration > 0) {
              const completionFactor = Math.min(1, Math.max(0.1, viewDuration / totalVideoDuration));
              baseWeight *= completionFactor;
            } else {
              baseWeight *= 0.5; // fallback pour contenu sans durée (ex: image ou erreur)
            }
        }
      
        const themes = flick?.analysis?.themes || [];
        const recencyBonus = getRecencyBonus(createdAt);
      
        for (const theme of themes) {
          const rarityBonus = themeGlobalFrequency[theme]
            ? Math.log(1 + totalFlicks / themeGlobalFrequency[theme])
            : 1.5;
      
          const currentThemeScore = themeScores[theme] || 0;
          const explorationBonus = currentThemeScore < 3 ? 1.3 : 1;
          const saturationFactor = 1 / Math.sqrt(1 + currentThemeScore);
      
          const totalScore =
            baseWeight *
            recencyBonus *
            rarityBonus *
            explorationBonus *
            saturationFactor *
            followFactor;
      
          themeScores[theme] = currentThemeScore + totalScore;
        }
    }
  
    // Tri & top 10
    const sortedThemes = Object.fromEntries(
      Object.entries(themeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
    );
  
    await User.findByIdAndUpdate(userId, {
      favoriteThemes: sortedThemes
    });
  
    //console.log(`🎨  User ${userId} a mis à jour ses thèmes favoris`, sortedThemes);
    return sortedThemes;
}

async function simulateNewUser() {
    const user = await User.create({
        username: faker.internet.username(),
        avatar: faker.image.avatar(),
        displayname: faker.person.fullName()
    });
}


async function simulateFlick() {
    for (let i = 0; i < 10; i++) {
        const user = await User.findOne().skip(Math.floor(Math.random() * (await User.countDocuments())));
        let themes = Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () => faker.commerce.department())

        if (user?.favoriteThemes && Object.keys(user.favoriteThemes).length > 0) {
            themes = Object.keys(user.favoriteThemes).slice(0, Math.min(3, Object.keys(user.favoriteThemes).length));
        }

        Flick.create({
            user: user._id,
            title: faker.lorem.sentence(3),
            description: faker.lorem.sentences(2),
            createdAt: faker.date.recent({ days: 30 }),
            analysis: {
                description: faker.lorem.sentence(),
                themes,
                //processing_time: faker.number.float({ min: 5, max: 20 })
            },
            item: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, ( _, index ) => {
                return {
                    isVideo: faker.datatype.boolean(),
                    duration: faker.number.int({ min: 10, max: 120 })
                }
            })
        });
    }
}

async function generateFeed(userId) {
    const user = await User.findById(userId);
    const hasThemes = user?.favoriteThemes && Object.keys(user.favoriteThemes).length > 0;
  
    if (!hasThemes) {
      const mostViewedFlicks = await FlickInteraction.aggregate([
        { $match: { type: "view" } },
        { $group: { _id: "$flick", viewCount: { $sum: 1 } } },
        { $sort: { viewCount: -1 } },
        { $limit: 35 },
        {
          $lookup: {
            from: "flicks",
            localField: "_id",
            foreignField: "_id",
            as: "flick"
          }
        },
        { $unwind: "$flick" },
        { $replaceRoot: { newRoot: "$flick" } }
      ]);
  
      if (mostViewedFlicks.length === 0) {
        const randomFlicks = await Flick.aggregate([{ $sample: { size: 35 } }]);
        return randomFlicks;
      }
  
      return mostViewedFlicks;
    }
  
    // 🔵 Feed avec encouragement des Flicks non vus
    const favoriteThemes = user.favoriteThemes;
  
    // 1. Récupère les IDs des Flicks déjà vus par l'user
    const seenFlicks = await FlickInteraction.find({ user: userId, type: "view" }).distinct("flick");
    const seenSet = new Set(seenFlicks.map(id => id.toString()));
  
    // 2. Récupère les Flicks pertinents
    const flicks = await Flick.find({
      "analysis.themes": { $in: Object.keys(favoriteThemes) }
    }).lean();
  
    // 3. Calcule le score, ajoute un bonus si le Flick est nouveau pour l'user
    const scoredFlicks = flicks.map(flick => {
      const themes = flick.analysis?.themes || [];
      let score = 0;
  
      for (const theme of themes) {
        score += favoriteThemes[theme] || 0;
      }
  
      // 🎁 Bonus pour les Flicks jamais vus
      if (!seenSet.has(flick._id.toString())) {
        score += 5; // le bonus peut être ajusté (3~10 selon test)
      }
  
      return { ...flick, _score: score };
    });
  
    scoredFlicks.sort((a, b) => {
      if (b._score === a._score) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b._score - a._score;
    });
  
    return scoredFlicks.slice(0, 35).sort(() => Math.random() - 0.5);
  }
  

  async function simulateView() {
    // 1. Crée un utilisateur fake
    const user = await User.create({
      username: faker.internet.username(),
      avatar: faker.image.avatar(),
      displayname: faker.person.fullName()
    });
  
    // 2. Récupère initialement un feed
    let feed = await generateFeed(user._id);
    console.log(`🔄  Feed initial généré pour ${user.displayname}`, feed.map(f => f.analysis.themes));
    let currentIndex = 0;
  
    // 3. Simule des abonnements à certains créateurs dans le feed
    const authorsInFeed = [...new Set(feed.map(f => f.user.toString()))];
    const authorsToFollow = authorsInFeed.filter(() => Math.random() < 0.4); // suit environ 40%
    await Promise.all(
      authorsToFollow.map(authorId =>
        Relation.create({ user: user._id, target: authorId, type: "follow" })
      )
    );
    console.log(`➕ ${user.displayname} suit ${authorsToFollow.length} créateurs`);
  
    const loop = async () => {
      if (feed.length === 0) {
        console.log("⚠️ Aucun Flick dans le feed. As-tu lancé seedFlicks.js ?");
        return;
      }
  
      const flick = feed[currentIndex];
      const isVideo = flick?.items?.some(i => i.isVideo);
      const startDate = new Date();
  
      let endDate;
      if (isVideo) {
        const totalDuration = getTotalFlickVideoDuration(flick);
        const watchRatio = 0.3 + Math.random() * 0.6; // entre 30% et 90%
        const watchDuration = Math.min(totalDuration, totalDuration * watchRatio);
        endDate = new Date(startDate.getTime() + watchDuration * 1000);
      }
  
      const duration = isVideo ? getInteractionDurationSeconds({ startDate, endDate }) : undefined;
  
      // Enregistre la vue
      await FlickInteraction.create({
        user: user._id,
        flick: flick?._id,
        type: "view",
        startDate,
        endDate
      });
  
      //console.log(
      //  `👁️  ${user.displayname} a vu "${flick.title}" (themes: ${flick.analysis.themes}) (${duration ? `${duration}s` : "image"})`
      //);
  
      // 4. Like plus probable si l'auteur est suivi
      const isFollowingAuthor = authorsToFollow.includes(flick.user.toString());
      const likeProbability = isFollowingAuthor ? 0.6 : 0.25;
  
      if (Math.random() < likeProbability) {
        await FlickInteraction.create({
          user: user._id,
          flick: flick._id,
          type: "like"
        });
        //console.log(`❤️  ${user.displayname} a liké "${flick.title}"`);
  
        if (Math.random() < 0.5) { // Augmenté de 0.3 à 0.5
          await FlickInteraction.create({
            user: user._id,
            flick: flick._id,
            type: "save"
          });
          //console.log(`💾  ${user.displayname} a sauvegardé "${flick.title}"`);
        }
  
        if (Math.random() < 0.35) { // Augmenté de 0.15 à 0.35
          await FlickInteraction.create({
            user: user._id,
            flick: flick._id,
            type: "repost"
          });
          //console.log(`🔄  ${user.displayname} a reposté "${flick.title}"`);
        }
  
        if (Math.random() < 0.4) { // Augmenté de 0.2 à 0.4
          await FlickInteraction.create({
            user: user._id,
            flick: flick._id,
            type: "comment"
          });
          //console.log(`💬  ${user.displayname} a commenté "${flick.title}"`);
        }
      }
  
      // 5. Mets à jour les thèmes favoris de l'utilisateur
      await updateUserFavoriteThemes(user._id);
  
      // 6. Avance dans le feed ou recharge
      currentIndex++;
      if (currentIndex >= feed.length) {
        console.log(`🔄 Fin du feed atteinte pour ${user.displayname}, on recharge...`);
        feed = await generateFeed(user._id);
        console.log(`🔄  Feed rechargé pour ${user.displayname}`, feed.map(f => f.analysis.themes));
        currentIndex = 0;
      }
    };
  
    // Lancer la boucle toutes les 2 à 5 secondes (plus naturel)
    //setInterval(loop, 2000 + Math.random() * 3000);
    setInterval(loop, 500);
}
  
  
//simulateFlick();
//simulateView();