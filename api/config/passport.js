import bcrypt from 'bcrypt';
import { secretKey } from '../../config';

const BCRYPT_SALT_ROUNDS = 12;

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('../sequelize');

passport.use(
    'register',
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
            session: false,
        },
        (username, password, done) => {
            try {
                User.findOne({
                    where: {
                        username,
                    },
                }).then((user) => {
                    if (user != null) {
                        console.log('username already taken');
                        return done(null, false, { message: 'username already taken' });
                    } else {
                        return bcrypt.hash(password, BCRYPT_SALT_ROUNDS).then((hashedPassword) => {
                            User.create({ username, password: hashedPassword }).then((newUser) => {
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
            usernameField: 'username',
            passwordField: 'password',
            session: false,
        },
        (username, password, done) => {
            try {
                User.findOne({
                    where: {
                        username,
                    },
                }).then((user) => {
                    if (user === null) {
                        return done(null, false, { message: 'bad username' });
                    } else {
                        return bcrypt.compare(password, user.password).then((response) => {
                            if (response !== true) {
                                console.log('passwords do not match');
                                return done(null, false, { message: 'passwords do not match' });
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
                    username: jwtPayload.id,
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
