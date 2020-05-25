module.exports = (sequelize, type) => {
    return sequelize.define('People', {
        PersonID: {
            type: type.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        FirstName: type.STRING,
        LastName: type.STRING,
        IndustryID: type.STRING,
        Email: {
            type: type.STRING,
            allowNull: false,
        },
        Password: {
            type: type.STRING,
            allowNull: false,
        },
    });
};
