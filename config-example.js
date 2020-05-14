const config = {
    sunapee: {
        database: {
            host: 'sunapee.cs.dartmouth.edu',
            user: 'USERNAME', // 'your sunapee username here'
            password: 'PASSWORD', // 'your sunapee password here'
            schema: 'nyc_inspections', // 'your sunapee default schema'
        },
        port: 3000,
    },
    local: {
        database: {
            host: 'localhost',
            user: 'USERNAME', // 'your localhost username here'
            password: 'PASSWORD', // your localhost password here'
            schema: 'nyc_inspections', // 'your localhost default schema here'
        },
        port: 3000,
    },
    secretKey: 'EXAMPLE_KEY',
};
module.exports = config;
