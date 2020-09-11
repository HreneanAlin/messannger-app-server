const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const {findOrCreateGoogleUser} = require('../services/GoogleUsersService')
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}

passport.serializeUser(function (user, done) {
    done(null, user);
});


passport.deserializeUser(function (user, done) {
    done(null, user)
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {

        try {
            const user = await findOrCreateGoogleUser(profile)
            return done(null, user)
        }catch (e) {
            console.log(e)

        }
    }
));