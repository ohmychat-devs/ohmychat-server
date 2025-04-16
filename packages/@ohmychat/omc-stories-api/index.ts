import { io, supabase } from "@ohmychat/ohmychat-backend-core";
import { scheduler } from "./utils/scheduler";
import setAudience from "./api/setAudience";
import createStory from "./api/createStory";
import getStories from "./api/getStories";

scheduler(5);

io.of('/stories').on("connection", (socket) => {
    console.log("Client connecté :", socket.id);

    socket.on('story/create', createStory);
    socket.on('stories/get', getStories)
    socket.on("audience/set", setAudience);
});

/*setAudience({
    id: "5d12dab2-ac76-49a2-aee6-23a2b349e5ce",
    source: "14d5c21a-7957-456f-85f3-a5b1b539797d",
    name: "test",
    targets: [
        "14d5c21a-7957-456f-85f3-a5b1b539797d"
    ]
})*/

/*await getStories("14d5c21a-7957-456f-85f3-a5b1b539797d", console.log)*/;