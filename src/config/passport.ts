import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import env from './env';
import { User } from '../models/User';
import { Portfolio } from '../models/Portfolio';

passport.use(
  new GoogleStrategy(
    {
      clientID: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      callbackURL: env.AUTH_GOOGLE_CALLBACK,
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const email = profile.emails && profile.emails[0]?.value;
        const avatar = profile.photos && profile.photos[0]?.value;

        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: email || '',
            name: profile.displayName || '',
            avatar,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

export default passport;

