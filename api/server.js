/* Server for Better-Linkedin
 * Author: Anna Matusewicz, Dartmouth CS61, Spring 2020
 * To run: npm start <local|sunapee>
 * Modeled off of tutorial at:
 * https://itnext.io/implementing-json-web-tokens-passport-js-in-a-javascript-application-with-react-b86b1f313436
 */
const express = require('express');
const mysql = require('mysql');
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

// NON-SEQUELIZE API FUNCTIONS
// Get config for database connection
const config = require('../config').local; // read credentials from config.js


// Database connection
app.use((req, res, next) => {
    global.connection = mysql.createConnection({
        host: config.database.host,
        user: config.database.user,
        password: config.database.password,
        database: config.database.schema,
    });
    global.connection.connect();
    next();
});

app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

// Set up router
const router = express.Router();

// Log request types to server console
router.use((req, res, next) => {
    console.log(`/${req.method}`);
    next();
});

// Set up routing
// Calls should be made to /api/employees with GET/PUT/POST/DELETE verbs
router.get('/', (req, res) => {
    res.send('Yo!  This my API.  Call it right, or don\'t call it at all!');
});

// POST -- create new event
router.post('/api/events/createEvent', (req, res) => {
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.PlannedEvents (EventName, EventTime, EventDescription) VALUES (?, ?, ?)',
        [req.body.eventName, new Date(req.body.eventTime), req.body.eventDesc],
        (error, results, fields) => {
            if (error) {
                console.log('ERROR!!!');
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            } else {
                console.log('NO ERROR!!!');
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// Start server running on port 3000
app.use(express.static(`${__dirname}/`));
app.use('/', router);
app.set('port', (process.env.PORT || config.port || 3000));
