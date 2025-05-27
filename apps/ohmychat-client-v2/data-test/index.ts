import mongoose from 'mongoose';

//const db = "mongodb+srv://ohmychatdev:WdDMSc7atiJp8QHT@omc-app.xefiuow.mongodb.net/omc-db?retryWrites=true&w=majority&appName=omc-app"
const db = "mongodb://localhost:27017/omc-db"

mongoose.connect(db, { dbName: "omc-db" }).then(() => {
    console.log("Connected to MongoDB");
});

import { runFeedCLI } from './runFeedCLI';
import { createPublications } from './function/createPublications';

runFeedCLI();