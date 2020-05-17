const passport = require('passport');
const jwt = require('jsonwebtoken');
const Person = require('../sequelize');
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
                    Person.findOne({
                        where: {
                            username: data.username,
                        },
                    }).then((newPerson) => {
                        newPerson
                            .update({
                                first_name: data.first_name,
                                last_name: data.last_name,
                                email: data.email,
                            })
                            .then(() => {
                                console.log('Person created in db');
                                const token = jwt.sign({ id: user.username }, secretKey);
                                res.status(200).send({
                                    auth: true,
                                    token,
                                    message: 'Person created',
                                });
                            });
                    });
                });
            }
        })(req, res, next);
    });
};
