const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20'); //Strategy???
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

// セッションを保存する処理らしい。userオブジェクトをシリアライズしてセッションに保存
passport.serializeUser((user, done) => { // DB判定のコールバックのdoneの第二引数のuserからきてる？
  done(null, user.id);
  console.log('serialize', user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => {
      done(null, user);
    })
});

passport.use(new GoogleStrategy({
  clientID: keys.googleClientID,
  clientSecret: keys.googleClientSecret,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  User.findOne({ googleId: profile.id }) //DBに存在するか判定
    .then((existingUser) => {
      if (existingUser) {
        done(null, existingUser);
      } else {
        new User({ googleId: profile.id })
          .save()
          .then(user => done(null, user));
      }
    });
}));