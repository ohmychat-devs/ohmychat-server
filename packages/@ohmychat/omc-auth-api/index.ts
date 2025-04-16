import { app, io, supabase } from "@ohmychat/ohmychat-backend-core";
import cookie from 'cookie';
import bodyParser from 'body-parser';
import { v4 as uuid } from 'uuid';

const cookie_options = {
    maxAge: 1000 * 60 * 60 * 24 * 30 * 3,
    httpOnly: true,
    secure: true,
    sameSite: 'none'
}

const namespaceAuth = '/auth';

function generateRandomCode(req) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const existingKeys = Object.keys(getUserTokens(req));
    let code;
    do {
        code = [...Array(4)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    } while (existingKeys.includes(`USR_TKN_${code}`));
    return code;
}

function setUserToken(res, req, token) {
    const existingTokens = getUserTokens(req);
    if (Object.values(existingTokens).includes(token)) return; // Ensure token is unique
    
    const randomCode = generateRandomCode(req);
    res.cookie(`USR_TKN_${randomCode}`, token, cookie_options);
}

function getUserTokens(req) {
    return Object.fromEntries(
        Object.entries(req.cookies)
        .filter(([key]) => key.startsWith('USR_TKN_'))
        .map(([key, value]) => [key.replace('USR_TKN_', ''), value])
    );
}

function getCurrentUserToken(res, req) {
    if(req.cookies['USR_TKN_CRNT']) return req.cookies['USR_TKN_CRNT'];

    const userTokens = getUserTokens(req);
    const tokenEntries = Object.entries(userTokens);
    const tokenCode = tokenEntries.length > 0 ? tokenEntries[0][0].replace('USR_TKN_', '') : null;
    if (!tokenCode) return null;

    res.cookie(`USR_TKN_CRNT`, tokenCode, cookie_options);
    return tokenCode;
}

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

app.get(namespaceAuth+'/cookies', (req, res) => {
    //clearUserTokens(req, res);

    const client_id = req.cookies['CLT_ID'] ?? uuid()
    res.cookie('CLT_ID', client_id, cookie_options).json({
        client_id,
        tokens: getUserTokens(req),
        active: getCurrentUserToken(res, req)
    });
});

app.post(namespaceAuth+'/login', async (req, res) => {
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
});

app.get(namespaceAuth + '/logout/:code', (req, res) => {
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
});

app.get(namespaceAuth + '/active/:code', (req, res) => {
    const { code } = req.params;
    const userTokens = getUserTokens(req);

    if (!userTokens[code]) {
        return res.status(404).json({ error: "Token non trouvé." });
    }

    const validatedToken = code !== 'CRNT' ? code : null;

    res.cookie('USR_TKN_CRNT', validatedToken, cookie_options)
        .json({ success: true, active: validatedToken });
});

io.of(namespaceAuth).on('connection', function(socket) {
    socket.on('join', (room) => {
        socket.join(room);
    })

    socket.on('disconnect', () => {
        console.log('User disconnected');
    })
});


//setUserToken(res, req, 'U2FsdGVkX1/4QViJuwpYG8SRC9u0LWvzsLz27gq8U1Te/cwe3Wbq0/Ypw17fdCNsk9liL4GeFevuAtHX7CJN5mbIsZP8nCebXeiv5iylwQV4eG/W0k4lJW71jeslZHZP2C9o6j96DfgHsOkNJhl9n99/q9tdmijjPrexwrneAc9pHg1CmShV/bysthYpauT+UGPA5oJJatsAlJsbee+bPZsIcga0AgLlH+xk1YX/LpBq8cjusid6AtFg4S5RCTlADuOqOKzBbjy8IHsbcGVKKqrMG1w2/z9QONZubg6xoAHcQLkcYfrEx7HPdMy6xEAgnx4grpWVHuBfDh4t8gjBtQbSocbyZAPCgE8XCHp2dy2T6zurxJAP9GlVlpW1ipAndFwcLOsKwQTQBM417CM2kg==');

//setUserToken(res, req, 'U2FsdGVkX19OxU1e54GwOVBGdTpK6jNHjY4hZ/hLzJxIGxGM3FOsey037sP7tCGKaEZmHJ23sjwpmVALgW82v5Bre68v3+EX98GLIdwVSdxezo05D4Qn6TJTwLcrSeNFUHqbGbAxibFFTx6ZzpX3J8/4/95kMXwWdwYdpq6zoPKtMbLY2WXv9iche2aSGl0ffFl2oiKMqhleK6hBlaZU6NaamcgCLBF67OxTm+DOXbedWL/r5Bnqq6zsc9bp3821v9lUaZYlh9PEGRUGc/q33vQU4CEdpQhn7Qp2q+b1pyd08UgClyqTKSFelP5SxmFB7kkzm/ZxBhg1FQyHd8QFv6eTh7gsJ7mjn9LUeUKUE6xzVwjLemDkbczuDo8lqTJORcnE7yQ897BlPiin94vAMQ==');