import { model } from "mongoose";
import { publicationSchema } from "./schemas/pub";
import { userSchema } from "./schemas/user";
import { interactionSchema } from "./schemas/iactn";

export const Publication = model('Publication', publicationSchema);
export const User = model('User', userSchema);
export const Interaction = model('Interaction', interactionSchema);