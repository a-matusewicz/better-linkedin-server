const passport = require('passport');

module.exports = (app) => {
    app.get('/api/users/findUser', (req, res, next) => {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                console.log(err);
            }
            if (info !== undefined) {
                console.log(info.message);
                res.status(404).send(info.message);
            } else {
                console.log('Person found in db from route');
                res.status(200).send({
                    auth: true,
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    message: 'Person found in db',
                });
            }
        })(req, res, next);
    });
};
