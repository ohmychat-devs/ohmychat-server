import cookie_options from "../constants/cookie_options";
import getUserTokens from "../functions/getUserTokens";

export default (req, res) => {
    const { code: randomCode } = req.params;
    const userTokens = getUserTokens(req);
    delete userTokens[randomCode];

    const nextActiveToken = randomCode === req.cookies['USR_TKN_CRNT']
        ? Object.keys(userTokens)[0] || null
        : req.cookies['USR_TKN_CRNT'];

    const validatedToken = nextActiveToken !== 'CRNT' ? nextActiveToken : null;

    console.log('Logout', randomCode);

    res.status(200)
        .cookie('CLT_ID', req.cookies['CLT_ID'], cookie_options)
        .clearCookie(`USR_TKN_${randomCode}`, { httpOnly: true, secure: true, sameSite: 'none' })
        .cookie('USR_TKN_CRNT', validatedToken, cookie_options)
        .json({ success: true, tokens: userTokens, active: validatedToken });
}