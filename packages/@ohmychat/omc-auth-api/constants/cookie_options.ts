const cookie_options = {
    maxAge: 1000 * 60 * 60 * 24 * 30 * 3,
    httpOnly: true,
    secure: true,
    sameSite: 'none'
}

export default cookie_options