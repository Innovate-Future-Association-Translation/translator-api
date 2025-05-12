import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from '../../config';
import { findUserOrCreateAccountForGoogleUser } from '../../services/user.service';
passport.use(
  new GoogleStrategy(
    {
      clientID: config.googleOauthClient,
      clientSecret: config.googleSecret,
      callbackURL: config.googleRedirectUrl,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (profile.emails && profile.emails.length > 0) {
          const email = profile.emails[0].value;

          const user = await findUserOrCreateAccountForGoogleUser(
            email,
            profile.id,
            profile.displayName
          );

          if (user) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: 'User authentication failed.',
            });
          }
        } else {
          return done(null, false, { message: 'Email not found in profile.' });
        }
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser((id: string, done) => {
  done(null, { id });
});

export default passport;
