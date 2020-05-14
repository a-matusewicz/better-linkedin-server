/* Server for Better-Linkedin
 * Author: Anna Matusewicz, Dartmouth CS61, Spring 2020
 * To run: npm start <local|sunapee>
 * Modeled off of tutorial at:
 * https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
 */
const express = require('express');
const logger = require('morgan');
const bodyparser = require('body-parser'); // allows us to get passed in api calls easily
const passport = require('passport');
const cors = require('cors');

const app = express();

const API_PORT = process.env.API_PORT || 3000;

require('./config/passport');

app.use(cors());
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
app.use(logger('dev'));
app.use(passport.initialize());

require('./routes/loginUser')(app);
require('./routes/registerUser')(app);
require('./routes/findUser')(app);
// require('./routes/deleteUser')(app);
// require('./routes/updateUser')(app);

app.listen(API_PORT, () => console.log(`Listening on port ${API_PORT}`));

module.exports = app;
