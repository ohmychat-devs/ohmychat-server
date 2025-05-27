import { Schema } from "mongoose";

export const userSchema = new Schema({
    id: String,
    tags: {
        type: [{ tag: String, weight: Number }],
        default: []
    },
    langs: {
        type: [{ lang: String, weight: Number }],
        default: []
    }
});