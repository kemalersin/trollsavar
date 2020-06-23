import passport from 'passport';
import randomstring from 'randomstring';

import {
    Strategy as TwitterStrategy
} from 'passport-twitter';

import Member from '../../api/member/member.model';

export function setup(User, config) {
    passport.use(new TwitterStrategy({
        consumerKey: config.twitter.clientID,
        consumerSecret: config.twitter.clientSecret,
        callbackURL: config.twitter.callbackURL,
        includeEmail: true
    },
        async function (token, tokenSecret, profile, done) {
            profile._json.id = `${profile._json.id}`;

            let role;

            if (profile.username == config.twitter.masterUser) {
                role = 'admin';
            }
            else {
                let member = await Member.findOne({ username: profile.username });
                role = (member) ? 'member' : 'user';
            }

            User.findOne({
                'profile.id': profile._json.id
            }).exec()
                .then(user => {
                    if (user) {
                        user.role = role;

                        user.isLocked = false;
                        user.isSuspended = false;
                        
                        user.name = profile.displayName;                        
                        user.username = profile.username;
                        user.email = profile._json.email;
                        user.profile = profile._json;
                        user.accessToken = token;
                        user.accessTokenSecret = tokenSecret;
                        
                        user.save();

                        return done(null, user);
                    }
                    
                    user = new User({
                        name: profile.displayName,
                        username: profile.username,
                        email: profile._json.email,
                        provider: 'twitter',
                        profile: profile._json,
                        accessToken: token,
                        accessTokenSecret: tokenSecret,
                        lastBlockId: null,
                        role
                    });

                    user.save()
                        .then(savedUser => done(null, savedUser))
                        .catch(err => done(err));
                })
                .catch(err => done(err));
        }));
}
