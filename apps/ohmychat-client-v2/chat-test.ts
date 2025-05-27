import mongoose, { set } from "mongoose";
import { faker } from "@faker-js/faker";
import { MongoMemoryReplSet  } from 'mongodb-memory-server';
import { EventEmitter } from "eventemitter3";
import { Observable, observable, observe } from "@legendapp/state";

//const mongoServer = await MongoMemoryReplSet.create({ replSet: { count: 4 } });
//console.log(mongoServer.getUri());

const db = "mongodb+srv://ohmychatdev:WdDMSc7atiJp8QHT@omc-app.xefiuow.mongodb.net/omc-db?retryWrites=true&w=majority&appName=omc-app"

mongoose.connect(db, { dbName: "omc-db" }).then(() => {
    console.log("Connected to MongoDB");
});

const ChatGroup = mongoose.model("ChatGroup", new mongoose.Schema({
    name: { type: String },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        status: { type: String, enum: ['accepted', 'pending', 'blocked'], required: true },
        last_message_seen: { type: String, default: null }
      }
    ],
    typing: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        type: { type: String, enum: ['text', 'audio'], required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true }));

const ChatMessage = mongoose.model("ChatMessage", new mongoose.Schema({
    group: { type: mongoose.Schema.Types.ObjectId, ref: "ChatGroup", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }, // ou utilise timestamps
    status: { type: String, enum: ['sent', 'delivered', 'read'], required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "ChatMessage" },
    attachments: [
      {
        url: { type: String },
        type: { type: String, enum: ['image', 'video', 'file'] },
        name: { type: String }
      }
    ]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}));

const User = mongoose.model("User", new mongoose.Schema({
    username: { type: String, required: true },
    avatar: { type: String },
    displayname: { type: String },
}));

const fetchChatList = (user: string) => {
    ChatGroup.find({ "members.user": user }).populate("members.user").lean().then((data) => {
        store.chat.set(chat => {
            const chatMap = new Map(chat.map(c => [c._id.toString(), c]));
            const profilesMap = new Map(store.profiles.get().map(p => [p._id.toString(), p]));

            data.forEach(c => chatMap.set(c._id.toString(), { ...c, members: c.members.map(m => ({ ...m, user: m.user._id })) }));
            data.forEach(c => c.members.forEach(m => profilesMap.set(m.user._id.toString(), m.user)));

            store.profiles.set(Array.from(profilesMap.values()));
            return Array.from(chatMap.values());
        });
    });

    ChatMessage.aggregate([
        {
          $lookup: {
            from: 'chatgroups',
            localField: 'group',
            foreignField: '_id',
            as: 'group'
          }
        },
        { $unwind: "$group" },
        { $match: { "group.members.user": new mongoose.Types.ObjectId(user) } },
        {
          $project: {
            group: "$group._id", // si tu veux garder juste l’ID du groupe
            user: 1,
            text: 1,
            createdAt: 1,
            status: 1,
            parent: 1,
            attachments: 1
          }
        }
      ]).then((data) => {
        store.messages.set((messages) => {
            const messagesMap = new Map(messages.map(c => [c._id.toString(), c]));
            data.forEach(c => messagesMap.set(c._id.toString(), { ...c, group: c.group._id }));
            return Array.from(messagesMap.values());
        });
    });
}

ChatGroup.watch([], { fullDocument: "updateLookup" }).on("change", ({ fullDocument, operationType  }) => {
    if(operationType === "delete") return;
    fullDocument.members.forEach(member => {
        emitter.emit("user_" + member.user, "chat-group-change", fullDocument);
    });
});

ChatMessage.watch([], { fullDocument: "updateLookup" }).on("change", ({ fullDocument, operationType  }) => {
    console.log(fullDocument);
    if(operationType === "delete") return;
    ChatGroup.findById(fullDocument.group).then(group => {
        group.members.forEach(member => {
            emitter.emit("user_" + member.user, "chat-message-change", fullDocument );
        });
    });
});

const store = observable({
    currentUser: observable("6825a4842eb44350344af0a0"),
    chat: [],
    messages: [],
    profiles: []
});

const emitter = new EventEmitter();
emitter.on("user_"+store.currentUser.get(), (event, data) => {
    switch (event) {
        case "chat-group-change":
            store.chat.set(chat => {
                const chatMap = new Map(chat.map(c => [c._id.toString(), c]));
                chatMap.set(data._id.toString(), data);
                return Array.from(chatMap.values());
            });
            break;
        case "chat-message-change":
            store.messages.set(messages => {
                const messagesMap = new Map(messages.map(c => [c._id.toString(), c]));
                messagesMap.set(data._id.toString(), data);
                return Array.from(messagesMap.values());
            });
            break;
        default:
            break;
    }
});

fetchChatList(store.currentUser.get());

const chatList = (user_: Observable<string>) => observable(() => {
    const user = user_.get();

    return store.chat.get().filter(c => c.members.some(m => m.user.toString() === user.toString())).map(c => {
        return {
            id: c._id.toString(),
            title: getTitle(c),
            lastActivity: getLastActivity(c),
            unread: getUnread(c),
        }
    }).sort((a, b) => new Date(b.lastActivity.date).getTime() - new Date(a.lastActivity.date).getTime());
});

const profile = (user: string) => {
    const p = store.profiles.get().find(p => p?._id?.toString() === user.toString());
    if(!p) {
        let profile;
        User.findById(user).then(u => {
            store.profiles.set(profiles => [...profiles, u]);
            profile = u;
        });
        return profile;
    }
    return p;
};

const getUnread = function (chat){
    const last_message_seen: string | null = chat.members.find(m => m.user.toString() === store.currentUser.get())?.last_message_seen;
    const messages = store.messages.get().filter(m => m.group.toString() === chat._id.toString()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    if(!last_message_seen) return messages.length;
    const unread = messages.slice(messages.findIndex(m => m._id.toString() === last_message_seen) + 1).filter(m => m.user.toString() !== store.currentUser.get());

    return unread.length;
}

const getTitle = function (chat: {
    name?: string,
    members: {
        user: string,
        status: string,
        last_message_seen: Date | number | null,
    }[],
}) : { type: string, displayname?: string, avatar?: string, username?: string } {
    if(chat.name) return {
        type: "group",
        displayname: chat.name,
    }

    const members = chat.members.filter(m => m.user.toString() !== store.currentUser.get());
    if(members.length === 0) return {
        type: "user_self"
    }

    if(members.length === 1) return {
        type: "user",
        displayname: profile(members[0].user)?.displayname,
        //avatar: members[0].avatar,
        username: profile(members[0].user)?.username,
    }

    return {
        type: "group",
        displayname: members.map(m => profile(m.user)?.displayname).join(", "),
    }
}

const getLastActivity = function (chat: {
    typing: {
        user: string,
        type: string,
        createdAt: Date,
    }[],
    members: {
        user: string,
        status: string,
        last_message_seen: Date | number | null,
    }[],
    createdAt: Date,
}) : {
    type: string,
    date: number,
    sources?: string[],
    content?: string,
    status?: string,
} {
    const typingAudio = chat?.typing?.filter(t => t.type === "audio" && t.user.toString() !== store.currentUser.get());
    if(typingAudio?.length > 0) {
        const latestTyping = typingAudio.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).pop();
        if (latestTyping) {
            return {
                type: "talking",
                date: new Date(latestTyping.createdAt || new Date()).getTime(),
                sources: chat?.typing?.filter(t => t.type === "audio" && t.user.toString() !== store.currentUser.get()).map(t => profile(t.user).displayname),
            }
        }
    }

    const typingText = chat?.typing?.filter(t => t.type === "text" && t.user.toString() !== store.currentUser.get());
    if(typingText?.length > 0) {
        const latestTyping = typingText.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).pop();
        if (latestTyping) {
            return {
                type: "typing",
                date: new Date(latestTyping.createdAt || new Date()).getTime(),
                sources: chat?.typing?.filter(t => t.type === "text" && t.user.toString() !== store.currentUser.get()).map(t => profile(t.user).displayname),
            }
        }
    }

    const messages: any[] = store.messages.get().filter(m => m.group.toString() === chat._id.toString());
    if(messages.length > 0) {
        const lastMessage = messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).pop();
        if(lastMessage.text) return {
            type: "text",
            date: lastMessage.createdAt,
            sources: [profile(lastMessage.user)?.displayname],
            content: lastMessage.text,
            status: lastMessage.status,
        }
    }

    return {
        type: "new_group",
        date: new Date(chat.createdAt).getTime(),
    }
}

observe(chatList(store.currentUser), ({ value:chat }) => {
    console.log(chat);
});




























/*setInterval(() => {
    store.currentUser.set(faker.string.uuid());
}, 2000);*/

/*const user1 = await User.create({
    username: "johndoe",
    displayname: "John Doe",
    avatar: "https://via.placeholder.com/150",
});

const user2 = await User.create({
    username: "johndoe2",
    displayname: "John Doe 2",
    avatar: "https://via.placeholder.com/150",
});

const user3 = await User.create({
    username: "johndoe3",
    displayname: "John Doe 3",
    avatar: "https://via.placeholder.com/150",
});

currentUser.set(user1._id.toString());

const chatGroups = [
    await ChatGroup.create({
        members: [{ user: user1._id, status: "accepted" }, { user: user2._id, status: "accepted" }]
    }),
    await ChatGroup.create({
        members: [{ user: user1._id, status: "accepted" }, { user: user3._id, status: "accepted" }]
    }),
    await ChatGroup.create({
        members: [{ user: user2._id, status: "accepted" }, { user: user3._id, status: "accepted" }]
    })
]*/

/*setInterval(async () => {
    const randomGroup = await ChatGroup.findById("6825a4842eb44350344af0a8");
    ChatMessage.create({
        group: randomGroup._id,
        user: randomGroup.members[Math.floor(Math.random() * randomGroup.members.length)]._id,
        text: faker.lorem.sentence(),
        status: "sent"
    });
}, 1000);*/