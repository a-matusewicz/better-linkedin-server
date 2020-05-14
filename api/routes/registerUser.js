const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../sequelize');
const { secretKey } = require('../../config');

module.exports = (app) => {
    app.post('/api/users/registerUser', (req, res, next) => {
        passport.authenticate('register', (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info !== undefined) {
                console.log(info.message);
                res.status(404).send(info.message);
            } else {
                req.logIn(user, (e) => {
                    const data = {
                        first_name: req.body.first_name,
                        last_name: req.body.last_name,
                        email: req.body.email,
                        username: user.username,
                    };
                    User.findOne({
                        where: {
                            username: data.username,
                        },
                    }).then((newUser) => {
                        newUser
                            .update({
                                first_name: data.first_name,
                                last_name: data.last_name,
                                email: data.email,
                            })
                            .then(() => {
                                console.log('user created in db');
                                const token = jwt.sign({ id: user.username }, secretKey);
                                res.status(200).send({
                                    auth: true,
                                    token,
                                    message: 'user created',
                                });
                            });
                    });
                });
            }
        })(req, res, next);
    });
};
