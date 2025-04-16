import getUserTokens from "./getUserTokens";

function generateRandomCode(req) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const existingKeys = Object.keys(getUserTokens(req));
    let code;
    do {
        code = [...Array(4)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (existingKeys.includes(`USR_TKN_${code}`));
    return code;
}

export default generateRandomCode