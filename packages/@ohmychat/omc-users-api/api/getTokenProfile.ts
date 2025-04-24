import jwt from "jsonwebtoken";
import { supabase } from "@ohmychat/ohmychat-backend-core";

export const getTokenProfile = async function (tokens, callback) {
    const ids = tokens.map(token => [token, jwt.decode(token, process.env.JWT_SECRET).id]);

    const { data: profile, error } = await supabase
        .from("users")
        .select("*")
        .in("id", ids.map(([,id]) => id));

    if (error) return callback(null);
    const profiles = ids.reduce((acc, [token, id]) => {
        const userProfile = profile.find(user => user.id === id);
        if (userProfile) {
            acc[token] = userProfile;
        }
        return acc;
    }, {});

    return callback(profiles);
}