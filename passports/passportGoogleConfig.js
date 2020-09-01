const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy;
if (process.env.NODE_ENV !== 'production') {
    require("dotenv").config({path: '.env'})

}

// passport.serializeUser(function(user, done) {
//     done(null, user.id);
// });

passport.serializeUser(function(user, done) {
    done(null, user);
});

// passport.deserializeUser(function(id, done) {
//     User.findById(id, function(err, user) {
//         done(err, user);
//     });
// });

passport.deserializeUser(function(user, done) {
    done(null,user)
});

passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL}/google/callback`
    },
    function(accessToken, refreshToken, profile, done) {
        //use the profile info (mainly Profile id) to check if the user is registered into db

        // User.findOrCreate({ googleId: profile.id }, function (err, user) {
        //     return done(err, user);
        // });

        return done (null,profile)
    }
));