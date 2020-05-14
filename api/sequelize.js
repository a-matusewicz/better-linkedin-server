const env = process.argv[2] || 'local'; // use localhost if enviroment not specified
const Sequelize = require('sequelize');
const config = require('../config')[env]; // read credentials from config.js
const userModel = require('./models/user');

const sequelize = new Sequelize(config.database.schema, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'mysql',
});

const User = userModel(sequelize, Sequelize); // added new

sequelize.sync()
    .then(() => {
        console.log('Users db and user table have been created.');
    });

module.exports = User;
