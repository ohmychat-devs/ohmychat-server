import { supabase } from "@ohmychat/ohmychat-backend-core";
import { Story } from "./types";
let stories: Story[] = [];

export const storiesChanges = ({ new: story }) => {
    if (story.active) {
        stories.push(story as Story);
    } else {
        stories = stories.filter((s) => s.id !== story.id);
    }
};

supabase
    .channel("ohmychat-realtime-stories")
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "stories" }, storiesChanges)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "stories" }, storiesChanges)
    .subscribe();

await supabase
    .from("stories")
    .select()
    .eq("active", true)
    .then(({ data, error }: { data: any; error: any }) => {
        if (error) {
            console.error("❌ Erreur lors de la récupération des stories :", error);
            return null;
        }        
        stories.push(...data);
    });
    
export const scheduler = (minutes?: number) => {
    const checkStories = () => {
        console.log("Checking for expired stories...", stories);
        stories?.filter((story) => story?.active)?.forEach((story) => {
            const { id, date, active } = story;

            var day_after_story = new Date(date).getTime() + (24 * 60 * 60 * 1000);
            var eta_ms = day_after_story - Date.now();

            if (eta_ms <= 0) {
                console.log(eta_ms, "expired story", { id, date, active });
                supabase.from("stories").update({ active: false }).eq("id", id).then(({ data, error }) => {
                    if (error) {
                        console.error("❌ Erreur lors de la mise à jour de la story :", error);
                        return null;
                    }
                });
            }
        });
    };

    checkStories(); // Run immediately on startup
    setInterval(checkStories, 1000 * 60 * (minutes || 5)); // Default to 5 minutes if no argument is provided
    console.log("Scheduler started for stories...");
};
