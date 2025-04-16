function removeUserToken(req, res, randomCode) {
    const cookieKey = `USR_TKN_${randomCode}`;
    if (req.cookies[cookieKey]) {
        res.cookie(cookieKey, {
            httpOnly: true,
            secure: true,
            sameSite: 'none'
        });
    }
}

export default removeUserToken