import jwt from 'jsonwebtoken';

function getUserTokens(req) {
    return Object.fromEntries(
        Object.entries(req.cookies)
        .filter(([key]) => key.startsWith('USR_TKN_'))
        .map(([key, value]) => {
            key = key.replace('USR_TKN_', '')
            return [key, value];
            
            /*if(key === 'CRNT') return [key, value];
            console.log(value);
            return [key, jwt.verify(value, process.env.JWT_SECRET)?.id];*/
        })
    );
}

export default getUserTokens