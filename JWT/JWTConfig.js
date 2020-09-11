const jwt = require('jsonwebtoken')


if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '../.env'})

}

const JWTConfig = (user) => {

    const expiresIn = '30d'

    const payload = {
        sub: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        userName: user.user_name,
        googleId:user.google_id,
        iat: Date.now()
    }
    const signedToken = jwt.sign(payload, process.env.JWT_PRIVATE_KEY, {expiresIn, algorithm: 'RS256'})
    console.log("The toke",signedToken)
    return {
        signedToken,
        expiresIn
    }


}

const JWTVerify = (user) => {
    let ok = false

    jwt.verify(user.token, process.env.JWT_PUBLIC_KEY, {algorithm: ['RS256']}, (err, payload) => {
        if (err) console.log('is error', err)
        if (payload &&
            payload.firstName === user.firstName &&
            payload.lastName === user.lastName &&
            payload.userName === user.userName) {
            console.log(payload)
            ok = true
        }
    })
    return ok
}


module.exports.issueJWT = JWTConfig
module.exports.JWTVerify = JWTVerify
