import cookie_options from "../constants/cookie_options";
import getUserTokens from "../functions/getUserTokens";

export default (req, res) => {
    const { code } = req.params;
    const userTokens = getUserTokens(req);

    if (!userTokens[code]) {
        return res.status(404).json({ error: "Token non trouvé." });
    }

    const validatedToken = code !== 'CRNT' ? code : null;

    res.cookie('USR_TKN_CRNT', validatedToken, cookie_options)
        .json({ success: true, active: validatedToken });
}