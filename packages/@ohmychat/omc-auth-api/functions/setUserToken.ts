import getUserTokens from "./getUserTokens";
import generateRandomCode from "./generateRandomCode";
import cookie_options from "../constants/cookie_options";

function setUserToken(res, req, token) {
    const existingTokens = getUserTokens(req);
    if (Object.values(existingTokens).includes(token)) return; // Ensure token is unique
    
    const randomCode = generateRandomCode(req);
    res.cookie(`USR_TKN_${randomCode}`, token, cookie_options);
}

export default setUserToken