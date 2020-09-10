const bcrypt = require('bcryptjs');
const { json } = require('express');
const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || '';

    let basicToken;
    if (!authToken.toLowerCase().startsWith('basic ')) {
        return res.status(401).json({ error: 'Missing basic token' });
    } else {
        basicToken = authToken.slice('basic '.length, authToken.length);
    }

    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken);

    if (!tokenUserName || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' });
    }
    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized request' });
            }
            return bcrypt.compare(tokenPassword, user.password)
                .then(passwordsMatch => {
                    if (!passwordsMatch) {
                        return res.status(401).json({ error: 'Unauthorized request' });
                    }
                    req.user = user;
                    next()
                })
        })
        .catch(next)
}

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || ''

    let bearerToken
    if (!authToken.toLowerCase().startsWith('bearer ')) {
        return res.status(401).json({ error: 'Missing bearer token' })
    } else {
        bearerToken = authToken.slice(7, authToken.length)
    }

    try {
        const payload = AuthService.verifyJwt(bearerToken)

        AuthService.getUserWithUserName(
            req.app.get('db'),
            payload.sub,
        )
            .then(user => {
                if (!user)
                    return res.status(401).json({ error: 'Unauthorized request' })

                req.user = user
                next()
            })

            .catch(err => {
                console.error(err)
                next(err)
            })
    } catch (error) {
        res.status(401).json({ error: 'Unauthorized request' })
    }
    next()
}


module.exports = {
    requireAuth,
};