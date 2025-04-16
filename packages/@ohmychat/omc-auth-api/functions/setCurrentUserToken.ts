import getUserTokens from "./getUserTokens";

function setCurrentUserToken(req, res, randomCode) {
    const userTokens = getUserTokens(req);
    
    if (!userTokens[randomCode]) {
        return res.status(404).json({ error: "Token non trouvé." });
    }

    res.cookie('USR_TKN_CRNT', randomCode, {
        maxAge: 7776000000, // 3 mois
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });

    res.json({ message: `Le token ${randomCode} est maintenant actif.` });
}

export default setCurrentUserToken