import { supabase } from "@ohmychat/ohmychat-backend-core";
import getUserTokens from "../functions/getUserTokens";
import cookie_options from "../constants/cookie_options";
import generateRandomCode from "../functions/generateRandomCode";

export default async (req, res) => {
    const { login, password } = req.body;
    
    supabase
    .from('users')
    .select('id, password:users_passwords(*)')
    .or(`username.eq.${login},email.eq.${login}`)
    .eq('password.password', password)
    .single()
    .then(({ data, error }) => {
        if (error) {
            console.log(error);
        }

        if (data) {
            const randomCode = Object.entries(getUserTokens(req))?.find(([key, value]) => value === data.id)?.[0]?.replace('USR_TKN_', '') ?? generateRandomCode(req);

            res.status(200)
                .cookie('CLT_ID', req.cookies['CLT_ID'], cookie_options)
                .cookie('USR_TKN_'+randomCode, data.id, cookie_options)
                .cookie('USR_TKN_CRNT', randomCode, cookie_options)
                .json({ 
                    success: true,
                    tokens: { ...getUserTokens(req), [randomCode]: data.id, CRNT: randomCode },
                    active: randomCode
                });
        }
    })
}