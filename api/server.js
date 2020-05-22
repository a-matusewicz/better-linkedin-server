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

// POST -- create new event (and RSVP record for creator)
router.post('/api/events/createEvent', (req, res) => {
    const currentDate = new Date(req.body.eventTime);
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.PlannedEvents (EventName, EventTime, EventDescription, IndustryID, OrganizerID) VALUES (?, ?, ?, ?, ?)',
        [req.body.eventName, currentDate, req.body.eventDesc, req.body.industryID, req.body.userID],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            // If event is successfully created, create a record in Attending for the user as the event organizer
            } else {
                global.connection.query('INSERT INTO BetterLinkedIn_sp20.Attending (PersonID, EventID, IsOrganizer, RSVPDate) VALUES (?, ?, ?, ?)',
                    [req.body.userID, results.insertId, 1, currentDate],
                    (error2, results2, fields2) => {
                        if (error2) {
                            res.send(JSON.stringify({ status: 400, error: error2, response: results2 }));
                            console.log(JSON.stringify({ status: 400, error: error2, response: results2 }));
                        } else {
                            res.send(JSON.stringify({ status: 200, error: null, response: results2 }));
                        }
                    });
            }
        });
});

// GET - get events for current person
router.get('/api/users/getEvents/:id', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT allEvents.EventID, EventName, EventTime, EventDescription, IndustryName, IsOrganizer, RSVPDate, OrganizerEmail FROM \
(SELECT EventID, EventName, EventTime, EventDescription, IndustryName, OrganizerID, Email as OrganizerEmail \
FROM (SELECT EventID, EventName, EventTime, EventDescription, IndustryName, OrganizerID FROM BetterLinkedIn_sp20.PlannedEvents p \
JOIN BetterLinkedIn_sp20.Industries i WHERE p.IndustryID = i.IndustryID) as e \
JOIN BetterLinkedIn_sp20.People p ON e.OrganizerID = p.PersonID) as allEvents \
JOIN (SELECT a.PersonID, EventID, IsOrganizer, RSVPDate, Email FROM BetterLinkedIn_sp20.Attending a JOIN BetterLinkedIn_sp20.People p ON a.PersonID = p.PersonID WHERE a.PersonID = ?) as allRSVPs;',
    [req.params.id],
    (error, results, fields) => {
        if (error) {
            res.send(JSON.stringify({ status: 400, error, response: results }));
        } else {
            res.send({ status: 200, error: null, data: results });
        }
    });
});

// GET - get all events
router.get('/api/events/getEvents', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT EventID, EventName, EventTime, EventDescription, IndustryName, OrganizerID, Email as OrganizerEmail \
FROM (SELECT EventID, EventName, EventTime, EventDescription, IndustryName, PersonID as OrganizerID \
FROM (SELECT e.EventID, EventName, EventTime, EventDescription, IndustryID, PersonID, IsOrganizer, RSVPDate \
FROM BetterLinkedIn_sp20.PlannedEvents e JOIN BetterLinkedIn_sp20.Attending a ON e.EventID = a.EventID WHERE IsOrganizer = 1) e \
JOIN BetterLinkedIn_sp20.Industries i ON e.IndustryID = i.IndustryID) as e JOIN People p ON e.OrganizerID = p.PersonID;',
    (error, results, fields) => {
        if (error) {
            res.send(JSON.stringify({ status: 400, error, response: results }));
        } else {
            console.log(results);
            res.send({ status: 200, error: null, data: results });
        }
    });
});

// DELETE -- remove rsvp record for given person and event
router.delete('/api/events/:PersonID/:EventID', (req, res) => {
    global.connection.query('DELETE FROM BetterLinkedIn_sp20.Attending WHERE PersonID = ? AND EventID = ?',
        [req.params.PersonID, req.params.EventID], (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// POST -- user attending new event
router.post('/api/events/RSVP', (req, res) => {
    console.log('IN RSVP');
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.Attending (PersonID, EventID, IsOrganizer, RSVPDate) VALUES (?, ?, ?, ?)',
        [req.body.PersonID, req.body.EventID, 0, new Date()],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// GET - get all industries
router.get('/api/industries/getIndustries', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT * FROM BetterLinkedIn_sp20.Industries',
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send({ status: 200, error: null, data: results });
            }
        });
});

// DELETE -- deletes event and corresponding attending/RSVP records
router.delete('/api/events/:eventID', (req, res) => {
    global.connection.query('DELETE FROM BetterLinkedIn_sp20.Attending WHERE EventID = ?', [req.params.eventID], (error, results, fields) => {
        if (error) {
            res.send(JSON.stringify({ status: 400, error, response: results }));
        // If event successfully deleted, delete corresponding attending records
        } else {
            global.connection.query('DELETE FROM BetterLinkedIn_sp20.PlannedEvents WHERE EventID = ?', [req.params.eventID], (error2, results2, fields2) => {
                if (error2) {
                    res.send(JSON.stringify({ status: 400, error: error2, response: results2 }));
                } else {
                    res.send(JSON.stringify({ status: 200, error: null, response: results2 }));
                }
            });
        }
    });
});

// Start server running on port 3000
app.use(express.static(`${__dirname}/`));
app.use('/', router);
app.set('port', (process.env.PORT || config.port || 3000));
