exports.importSQL = () => {
   
    // mysql -u doadmin -p -h dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com -P 25060 live_atricent < /var/www/Atricent/update_db.sql
    const { exec } = require('child_process');
    // exec('gunzip < app/data/size_dump.sql.gz | mysql -u root -p atricent_old', (error, stdout, stderr) => {
        // mysql -u doadmin -p -h dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com -P 25060 live_atricent < /var/www/Atricent/update_db.sql
    exec('mysql -u doadmin -pAVNS_o9klOLdLGD5avJq3GMt -h dbaas-db-1815241-do-user-7338207-0.b.db.ondigitalocean.com -P 25060 live_atricent < app/data/size_dump.sql', (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
    
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });
    
}