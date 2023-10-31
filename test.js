const mysql = require('mysql2');

const connection1 = mysql.createConnection({
    host: 'dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com',
    port: 25060,
    user: 'doadmin',
    password: 'AVNS_o9klOLdLGD5avJq3GMt',
    database: 'live_atricent',
});
if (connection1) {
    console.log('connected1')
}
const connection2 = mysql.createConnection({
    host: 'dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com',
    port: 25060,
    user: 'doadmin',
    password: 'AVNS_o9klOLdLGD5avJq3GMt',
    database: 'atricent_scrappers',
});
if (connection2) {
    console.log('connected2')
}

// simple query
// connection.query(
//     'SELECT * FROM `sizes`',
//     function (err, results, fields) {
//         console.log(results); // results contains rows returned by server
//         console.log(fields); // fields contains extra meta data about results, if available
//     }
// );
// console.log('consoled')

connection1.connect((err) => {
    if (err) throw err;
    console.log('Connected to connection1!');
    const sql = 'SELECT * FROM sizes';
    connection1.query(sql, (err, result) => {
      if (err) throw err;
      console.log(`${result.length} record(s) retrieved from sizes`);
      connection2.connect((err) => {
        if (err) throw err;
        console.log('Connected to connection2!');
        const sql = 'INSERT INTO sizes (id, variation_id, meta, status) VALUES ?';
        const values = result.map(record => [record.id, record.variation_id, record.meta, record.status]);
        connection2.query(sql, [values], (err, result) => {
          if (err) throw err;
          console.log(`${result.affectedRows} record(s) inserted into table2`);
        });
      });
    });
  });


  connection1.end((err) => {
    if (err) throw err;
    console.log('Connection1 closed!');
  });
  
  connection2.end((err) => {
    if (err) throw err;
    console.log('Connection2 closed!');
  });