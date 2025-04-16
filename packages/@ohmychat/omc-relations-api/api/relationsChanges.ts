import { io } from "@ohmychat/ohmychat-backend-core";

export default (payload) => {
    const { new: data } = payload;
    if (!data || !data?.source) return;

    console.log("user:", data.source, "relation:", data.target, "status:", data.status);

    io.of("/relations").to("user/" + data.source).emit("incoming/relation", data);
    io.of("/relations").to("user/" + data.target).emit("incoming/relation", data);
}