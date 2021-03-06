const passport = require('passport');
const User = require("../models/user-model.js");
const Mailbox = require("../models/mailbox-model.js");

// serialize : saving user data in the session
passport.serializeUser((userDoc, done) => {
    console.log("SERIALIZE (save to session)");
    done(null, userDoc._id);
});

passport.deserializeUser((idFromSession, done) => {
    User.findById(idFromSession)
    .then((userDoc) => {
        done(null, userDoc);
    })
    .catch((err) => {
        done(err);
    });
});

function passportSetup(app){
    app.use(passport.initialize());
    app.use(passport.session());
    app.use((req, res, next) => {
        res.locals.blahUser = req.user;
        next();
    });
}

module.exports = passportSetup;