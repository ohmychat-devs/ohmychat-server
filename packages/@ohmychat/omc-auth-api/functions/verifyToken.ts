import jwt from "jsonwebtoken";

export const verifyToken = async (token: string) => {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded && !decoded?.id) return;
    return decoded?.id;
};