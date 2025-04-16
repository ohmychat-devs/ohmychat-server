import cookie_options from "../constants/cookie_options";
import getCurrentUserToken from "../functions/getCurrentUserToken";
import getUserTokens from "../functions/getUserTokens";
import { v4 as uuid } from 'uuid';

export default (req, res) => {
    //clearUserTokens(req, res);

    const client_id = req.cookies['CLT_ID'] ?? uuid()
    res.cookie('CLT_ID', client_id, cookie_options).json({
        client_id,
        tokens: getUserTokens(req),
        active: getCurrentUserToken(res, req)
    });
}