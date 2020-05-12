import Sequelize from 'sequelize';
import UserModel from './models/user';

const env = process.argv[2] || 'local'; // use localhost if enviroment not specified
const config = require('../config')[env]; // read credentials from config.js

const sequelize = new Sequelize(config.database.schema, config.database.user, config.database.password, {
    host: config.database.host,
    dialect: 'sql',
});

const User = new UserModel(sequelize, Sequelize); // added new

sequelize.sync()
    .then(() => {
        console.log('Users db and user table have been created.');
    });

module.exports = User;
