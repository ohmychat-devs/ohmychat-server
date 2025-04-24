import jwt from "jsonwebtoken";
import { io as ioClient } from "socket.io-client";

const TEST_IDS = ['2e25cad4-ba67-439c-b3c7-ac438b8275b1', '5faad4e4-de70-47a1-8620-365d010e27d1', '97d36994-1531-48af-93c6-0006f62b02e3'];
const groupId = '92044b3a-12c5-4201-b1e8-4e2241a987c3';

const connectTest = function (token) {
    const socketClient = ioClient("http://localhost");

    socketClient.on("connect", () => {
        console.log("connected");
        socketClient.emit("chatList_join", token);
        //socketClient.emit("conversation_join", token, groupId);
    });

    socketClient.on("chatList", (data) => {
        console.log(data);
    });

    socketClient.on("conversation-data", (data) => {
        console.log(data?.length);
    });

    socketClient.on("disconnect", () => {
        console.log("disconnected");
        socketClient.emit("chatList_leave", token);
    });
}

const tokens = Array(1).fill(0).flatMap(i => TEST_IDS);
tokens.forEach(TEST_ID => {
    const token = jwt.sign({ id: TEST_ID }, process.env.JWT_SECRET, { expiresIn: "1h" });
    connectTest(token);
});

/*console.log(
    Object.groupBy([
        { id: 1, name: 'a' },
        { id: 2, name: 'b' },
    ], v => v.id)
);*/