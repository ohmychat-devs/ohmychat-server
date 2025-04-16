function getUserTokens(req) {
    return Object.fromEntries(
        Object.entries(req.cookies)
        .filter(([key]) => key.startsWith('USR_TKN_'))
        .map(([key, value]) => [key.replace('USR_TKN_', ''), value])
    );
}

export default getUserTokens