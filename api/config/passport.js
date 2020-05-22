const BCRYPT_SALT_ROUNDS = 12;

const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { secretKey } = require('../../config');
const User = require('../sequelize');

passport.use(
    'register',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false,
        },
        (email, password, done) => {
            try {
                User.findOne({
                    where: {
                        Email: email,
                    },
                }).then((user) => {
                    if (user != null) {
                        console.log('email already taken');
                        return done(null, false, { message: 'email already taken' });
                    } else {
                        return bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then((hashedPassword) => {
                            User.create({ Email: email, Password: hashedPassword }).then((newUser) => {
                                console.log('user created');
                                // note the return needed with passport local - remove this return for passport JWT to work
                                return done(null, newUser);
                            });
                        });
                    }
                });
            } catch (err) {
                done(err);
            }
        },
    ),
);

passport.use(
    'login',
    new LocalStrategy(
        {
            usernameField: 'email',
            passwordField: 'password',
            session: false,
        },
        (email, password, done) => {
            try {
                User.findOne({
                    where: {
                        Email: email,
                    },
                }).then((user) => {
                    if (user === null) {
                        return done(null, false, { message: 'Email or password is incorrect.' });
                    } else {
                        return bcrypt.compare(password, user.Password).then((response) => {
                            if (response !== true) {
                                return done(null, false, { message: 'Email or password is incorrect.' });
                            }
                            console.log('user found & authenticated');
                            // note the return needed with passport local - remove this return for passport JWT
                            return done(null, user);
                        });
                    }
                });
            } catch (err) {
                done(err);
            }
        },
    ),
);

const opts = {
    jwtFromRequest: ExtractJWT.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: secretKey,
};

passport.use(
    'jwt',
    new JWTstrategy(opts, (jwtPayload, done) => {
        try {
            User.findOne({
                where: {
                    Email: jwtPayload.id,
                },
            }).then((user) => {
                if (user) {
                    console.log('user found in db in passport');
                    // note the return removed with passport JWT - add this return for passport local
                    done(null, user);
                } else {
                    console.log('user not found in db');
                    done(null, false);
                }
            });
        } catch (err) {
            done(err);
        }
    }),
);
