import mongoose, { Schema, Types } from "mongoose";

export const publicationSchema = new Schema({
    id: String,
    user: Types.ObjectId,
    type: String,
    mediaTypes: [String],
    themes: [String],
    lang: String,
    createdAt: { type: Date, default: Date.now }
});