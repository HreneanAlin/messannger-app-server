const passport = require('passport')
const {findOrCreateFacebookUser} = require("../services/FaceBookUserService")
const FacebookStrategy = require('passport-facebook').Strategy
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}

passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.SERVER_URL}/facebook/callback`,
        _profileFields: ['id', 'displayName', 'photos', 'email']
    },
   async (accessToken, refreshToken, profile, done) => {
       try {
           const user = await findOrCreateFacebookUser(profile)
           return done(null, user)
       }catch (e) {
           console.log(e)

       }

    }
));
