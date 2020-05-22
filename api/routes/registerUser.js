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
            if (info) {
                console.log(info.message);
                res.status(404).send(info.message);
            } else {
                req.logIn(user, (e) => {
                    const data = {
                        FirstName: req.body.first_name,
                        LastName: req.body.last_name,
                        Email: user.Email,
                    };
                    Person.findOne({
                        where: {
                            Email: data.Email,
                        },
                    }).then((newPerson) => {
                        newPerson
                            .update({
                                FirstName: data.FirstName,
                                LastName: data.LastName,
                                Email: data.Email,
                            })
                            .then(() => {
                                console.log('Person created in db');
                                const token = jwt.sign({ id: user.Email }, secretKey);
                                res.status(200).send({
                                    auth: true,
                                    token,
                                    message: 'Person created',
                                    id: newPerson.id,
                                });
                            });
                    });
                });
            }
        })(req, res, next);
    });
};
