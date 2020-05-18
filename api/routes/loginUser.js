const passport = require('passport');
const jwt = require('jsonwebtoken');
const { secretKey } = require('../../config');
const Person = require('../sequelize');


module.exports = (app) => {
    app.get('/api/users/loginUser', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info !== undefined) {
                console.log(info.message);
                res.status(404).send(info.message);
            } else {
                req.logIn(user, (e) => {
                    Person.findOne({
                        where: {
                            username: user.username,
                        },
                    }).then((foundPerson) => {
                        const token = jwt.sign({ id: foundPerson.username }, secretKey);
                        res.status(200).send({
                            auth: true,
                            token,
                            message: 'user found & logged in',
                        });
                    });
                });
            }
        })(req, res, next);
    });
};
