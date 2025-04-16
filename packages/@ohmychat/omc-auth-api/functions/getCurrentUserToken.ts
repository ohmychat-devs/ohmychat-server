import cookie_options from "../constants/cookie_options";
import getUserTokens from "./getUserTokens";

function getCurrentUserToken(res, req) {
    if(req.cookies['USR_TKN_CRNT']) return req.cookies['USR_TKN_CRNT'];

    const userTokens = getUserTokens(req);
    const tokenEntries = Object.entries(userTokens);
    const tokenCode = tokenEntries.length > 0 ? tokenEntries[0][0].replace('USR_TKN_', '') : null;
    if (!tokenCode) return null;

    res.cookie(`USR_TKN_CRNT`, tokenCode, cookie_options);
    return tokenCode;
}

export default getCurrentUserToken;