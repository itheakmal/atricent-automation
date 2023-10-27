const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com',
    port: 25060,
    user: 'doadmin',
    password: 'AVNS_o9klOLdLGD5avJq3GMt',
    database: 'live_atricent',
});
if (connection) {
    console.log('connected')
}

// simple query
connection.query(
    'SELECT * FROM `user_auth`',
    function (err, results, fields) {
        console.log(results); // results contains rows returned by server
        console.log(fields); // fields contains extra meta data about results, if available
    }
);
console.log('consoled')