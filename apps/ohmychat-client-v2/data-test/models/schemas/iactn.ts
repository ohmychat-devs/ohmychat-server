import { Schema } from "mongoose";

export const interactionSchema = new Schema({
    id: String,
    type: String,
    createdAt: { type: Date, default: Date.now },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    publication: { type: Schema.Types.ObjectId, ref: 'Publication' }
});