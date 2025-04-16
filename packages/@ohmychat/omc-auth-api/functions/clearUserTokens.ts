import getUserTokens from "./getUserTokens";

function clearUserTokens(req, res) {
    const userTokens = getUserTokens(req);
    Object.keys(userTokens).forEach(code => {
        res.clearCookie(`USR_TKN_${code}`, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
    });

    // Supprime aussi le cookie du token actuel s'il existe
    if (req.cookies['USR_TKN_CRNT']) {
        res.clearCookie('USR_TKN_CRNT', {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
    }
}

export default clearUserTokens