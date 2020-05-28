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
// Get config for database connection (sunapee or local)
const config = require('../config').sunapee;

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
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.PlannedEvents (EventName, EventTime, EventDescription, IndustryID, OrganizerID) VALUES (?, ?, ?, ?, ?)',
        [req.body.eventName, new Date(req.body.eventTime), req.body.eventDesc, req.body.industryID, req.body.userID],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            // If event is successfully created, create a record in Attending for the user as the event organizer
            } else {
                global.connection.query('INSERT INTO BetterLinkedIn_sp20.Attending (PersonID, EventID, IsOrganizer, RSVPDate) VALUES (?, ?, ?, ?)',
                    [req.body.userID, results.insertId, 1, new Date()],
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

// POST -- create new group (and member record for creator)
router.post('/api/groups/createGroup', (req, res) => {
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.InterestGroups (GroupName, GroupDescription, IndustryID, OrganizerID) VALUES (?, ?, ?, ?)',
        [req.body.groupName, req.body.groupDesc, req.body.industryID, req.body.userID],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            // If group is successfully created, create a record in MemberOf for the user as the group organizer
            } else {
                global.connection.query('INSERT INTO BetterLinkedIn_sp20.MemberOf (PersonID, GroupID, IsOrganizer, JoinDate) VALUES (?, ?, ?, ?)',
                    [req.body.userID, results.insertId, 1, new Date()],
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

// GET - get groups for current person
router.get('/api/users/getGroups/:id', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT allGroups.GroupID, GroupName, GroupDescription, IndustryName, IsOrganizer, JoinDate, OrganizerEmail FROM \
(SELECT GroupID, GroupName, GroupDescription, IndustryName, OrganizerID, Email as OrganizerEmail \
FROM (SELECT GroupID, GroupName, GroupDescription, IndustryName, OrganizerID FROM BetterLinkedIn_sp20.InterestGroups p \
JOIN BetterLinkedIn_sp20.Industries i WHERE p.IndustryID = i.IndustryID) as e \
JOIN BetterLinkedIn_sp20.People p ON e.OrganizerID = p.PersonID) as allGroups \
JOIN (SELECT a.PersonID, GroupID, IsOrganizer, JoinDate, Email FROM BetterLinkedIn_sp20.MemberOf a JOIN BetterLinkedIn_sp20.People p ON a.PersonID = p.PersonID WHERE a.PersonID = ?) as allMember;',
    [req.params.id],
    (error, results, fields) => {
        if (error) {
            res.send(JSON.stringify({ status: 400, error, response: results }));
        } else {
            res.send({ status: 200, error: null, data: results });
        }
    });
});

// GET - get all groups
router.get('/api/groups/getGroups', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT GroupID, GroupName, GroupDescription, IndustryName, OrganizerID, Email as OrganizerEmail \
FROM (SELECT GroupID, GroupName, GroupDescription, IndustryName, PersonID as OrganizerID \
FROM (SELECT e.GroupID, GroupName, GroupDescription, IndustryID, PersonID, IsOrganizer, JoinDate \
FROM BetterLinkedIn_sp20.InterestGroups e JOIN BetterLinkedIn_sp20.MemberOf a ON e.GroupID = a.GroupID WHERE IsOrganizer = 1) e \
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

// DELETE -- remove membership record for given person and group
router.delete('/api/groups/:PersonID/:GroupID', (req, res) => {
    global.connection.query('DELETE FROM BetterLinkedIn_sp20.MemberOf WHERE PersonID = ? AND GroupID = ?',
        [req.params.PersonID, req.params.GroupID], (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// POST -- user joining a group
router.post('/api/groups/joinGroup', (req, res) => {
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.MemberOf (PersonID, GroupID, IsOrganizer, JoinDate) VALUES (?, ?, ?, ?)',
        [req.body.PersonID, req.body.GroupID, 0, new Date()],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// DELETE -- deletes group and corresponding membership records
router.delete('/api/groups/:groupID', (req, res) => {
    global.connection.query('DELETE FROM BetterLinkedIn_sp20.MemberOf WHERE GroupID = ?', [req.params.groupID], (error, results, fields) => {
        if (error) {
            res.send(JSON.stringify({ status: 400, error, response: results }));
        // If group successfully deleted, delete corresponding membership records
        } else {
            global.connection.query('DELETE FROM BetterLinkedIn_sp20.InterestGroups WHERE GroupID = ?', [req.params.groupID], (error2, results2, fields2) => {
                if (error2) {
                    res.send(JSON.stringify({ status: 400, error: error2, response: results2 }));
                } else {
                    res.send(JSON.stringify({ status: 200, error: null, response: results2 }));
                }
            });
        }
    });
});

// POST -- user adding employment history
router.post('/api/employment/add', (req, res) => {
    global.connection.query('INSERT INTO BetterLinkedIn_sp20.Employed (CompanyID,PersonID, CompanyPosition, StartDate, EndDate, EmploymentDescription) VALUES (?, ?, ?, ?, ?, ?)',
        [req.body.companyID, req.body.personID, req.body.companyPosition, new Date(req.body.startDate), new Date(req.body.endDate), req.body.description],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
                console.log(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send(JSON.stringify({ status: 200, error: null, response: results }));
            }
        });
});

// GET - get employment for current person
router.get('/api/users/getEmployment/:id', (req, res) => {
    global.connection.query('SELECT * FROM BetterLinkedIn_sp20.Employed a JOIN  BetterLinkedIn_sp20.Companies b ON a.CompanyID=b.CompanyID WHERE PersonID = ?',
        [req.params.id],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send({ status: 200, error: null, data: results });
            }
        });
});

// Delete - delete employment for current person at company id
router.delete('/api/deleteEmployment', (req, res) => {
    global.connection.query('DELETE FROM BetterLinkedIn_sp20.Employed WHERE PersonID = ? AND CompanyID= ? AND Desc= ?',
        [req.body.PersonId, req.body.CompanyID, req.body.Desc],
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send({ status: 200, error: null, data: results });
            }
        });
});

// GET - get all companies
router.get('/api/companies/getCompanies', (req, res) => {
    // eslint-disable-next-line no-multi-str
    global.connection.query('SELECT * FROM BetterLinkedIn_sp20.Companies',
        (error, results, fields) => {
            if (error) {
                res.send(JSON.stringify({ status: 400, error, response: results }));
            } else {
                res.send({ status: 200, error: null, data: results });
            }
        });
});

// Start server running on port 3000
app.use(express.static(`${__dirname}/`));
app.use('/', router);
app.set('port', (process.env.PORT || config.port || 3000));
