const passport = require('passport');
const jwt = require('jsonwebtoken');
const Person = require('../sequelize');
const { secretKey } = require('../../config');

module.exports = (app) => {
    app.put('/api/users/updateUser', (req, res, next) => {
        passport.authenticate('login', (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info) {
                console.log(info.message);
                res.status(404).send(info.message);
            } else {
                req.logIn(user, (e) => {
                    Person.findOne({
                        where: {
                            email: user.Email,
                        },
                    }).then((foundPerson) => {
                        foundPerson
                            .update({
                                FirstName: data.FirstName,
                                LastName: data.LastName,
                                Email: data.Email,
                            })
                            .then(() => {
                                console.log('Person updated in db');
                                const token = jwt.sign({ id: user.Email }, secretKey);
                                res.status(200).send({
                                    auth: true,
                                    token,
                                    message: 'Person updated',
                                    id: foundPerson.id,
                                });
                            });
                    });
                });
            }
        })(req, res, next);
    });
};
