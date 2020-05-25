const env = 'sunapee'; // can also use localhost here
const Sequelize = require('sequelize');
const config = require('../config')[env]; // read credentials from config.js
const personModel = require('./models/person');

const sequelize = new Sequelize(config.database.schema, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const Person = personModel(sequelize, Sequelize); // added new

sequelize.sync()
    .then(() => {
        console.log('People db and people table have been created.');
    });

module.exports = Person;
