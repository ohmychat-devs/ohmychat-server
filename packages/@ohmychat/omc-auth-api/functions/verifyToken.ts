import jwt from "jsonwebtoken";
import removeUserToken from "./removeUserToken";
import { events } from "@ohmychat/ohmychat-backend-core";

export const verifyToken = async (token: string) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded && !decoded?.id) return;
        return decoded?.id;
    } catch (error) {
        events.emit('token_expired', token);
    }
};