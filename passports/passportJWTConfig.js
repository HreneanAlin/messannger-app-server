const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const {getUserByDbId, getGoogleUserById, getFaceBookUserById} = require('../repository/usersRepository')

if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '../.env'})
}

const publicKey= "-----BEGIN RSA PUBLIC KEY-----\n" + process.env.JWT_PUBLIC_KEY+"\n-----END RSA PUBLIC KEY-----"

const options = {
    jwtFromRequest: ExtractJwt.fromBodyField('token'),
    secretOrKey: publicKey,
    algorithms: ['RS256']
}


passport.use(new JwtStrategy(options, async (jwt_payload, done) => {
 try {
     let user;
     if(jwt_payload.facebookId){
         user = await getFaceBookUserById(jwt_payload.facebookId)
         if(user)  return done(null,user)
     }

     if(jwt_payload.googleId) {
         user = await getGoogleUserById(jwt_payload.googleId)
         if(user) return  done(null,user)
     }
      user = await getUserByDbId(jwt_payload.sub)
     if(user) return  done(null, user)
     return done (null,false)
 }catch (e) {
    return  done(e,false)
 }
}));

