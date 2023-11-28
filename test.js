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

// variations
connection1.connect((err) => {
    if (err) throw err;
    console.time('first')
    console.time('second')
    console.log('Connected to connection1!');
    const sql = 'SELECT * FROM variations';
    connection1.query(sql, (err, result) => {
        if (err) throw err;
        console.log(`${result.length} record(s) retrieved from variations`);
        console.timeEnd('first')
        connection2.connect((err) => {
            if (err) throw err;
            console.log('Connected to connection2!');
            const sql = 'INSERT INTO variations (id, product_id, color_id, price, discounted_price, price_description, image, images, link, color_status, downloaded, active, images_downloaded, show_in_wardrobe, similar_products, recommendations, cluster_id, classifier) VALUES ?';
            const values = result.map(record => [record.id, record.product_id, record.color_id, record.price, record.discounted_price, record.price_description, record.image, record.images, record.link, record.color_status, record.downloaded, record.active, record.images_downloaded, record.show_in_wardrobe, record.similar_products, record.recommendations, record.cluster_id, record.classifier]);
            connection2.query(sql, [values], (err, result) => {
                if (err) throw err;
                console.log(`${result.affectedRows} record(s) inserted into variations`);
                console.timeEnd('second')

                connection1.end((err) => {
                    if (err) throw err;
                    console.log('Connection1 closed!');
                });

                connection2.end((err) => {
                    if (err) throw err;
                    console.log('Connection2 closed!');
                });
            });
        });
    });
});