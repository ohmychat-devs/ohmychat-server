import { supabase } from "@ohmychat/ohmychat-backend-core";

const getStories = async (user: string, callback?: any) => {
    const stories = new Map<string, any>(); // clé = story.id

    // 1. 🔹 Stories postées par l'utilisateur
    const { data: ownStories, error: ownError } = await supabase
        .from("stories")
        .select("*")
        .eq("active", true)
        .eq("source", user);

    if (ownError) {
        console.error("❌ Erreur ownStories:", ownError);
    } else {
        ownStories?.forEach((story) => stories.set(story.id, story));
    }

    // 2. 🔸 Stories publiques des utilisateurs suivis
    const { data: followedUsers, error: publicError } = await supabase
        .from("relations")
        .select("target!inner(stories!inner(*))")
        .eq("source", user)
        .eq("status", "follow")
        .eq("target.stories.audiencetype", "public")
        .eq("target.stories.active", true);

    if (publicError) {
        console.error("❌ Erreur publicFollowedStories:", publicError);
    } else {
        followedUsers?.forEach((relation) => {
            relation?.target?.stories?.forEach((story) =>
                stories.set(story.id, story)
            );
        });
    }

    // 3. 🔒 Stories privées visibles via des audiences dont l'user est target
    const { data: privateAudienceStories, error: audienceError } = await supabase
        .from("stories")
        .select("*, audience_check:audience!inner()")
        .eq("active", true)
        .contains("audience_check.targets", [user]);

    if (audienceError) {
        console.error("❌ Erreur privateAudienceStories:", audienceError);
    } else {
        privateAudienceStories?.forEach((story) =>
            stories.set(story.id, story)
        );
    }

    // ✅ Retourne toutes les stories sans doublons
    return callback(Array.from(stories.values()));
};

export default getStories;