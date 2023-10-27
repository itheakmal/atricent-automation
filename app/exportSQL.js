const { importSQL } = require('./importSQL');
const { sql2gzip } = require('./sql2gzip');

exports.exportSQL = async (filePath, fileName) => {
    const mysqldump = require('mysqldump');
    // connect to db
    // prepare for export
    // export
    // upload the dump file
    // create a new table sizes_%V (size_1)
    // import into this table
    // 
    // a table with versions, pointing to current version

    // once import is complete change the current version in version_table
    // delete old tables if it reaches size_7

    // step 1,2,3
    // dump the result straight to a compressed file
    // const dumpDB = () => {

    console.log('file started')
    mysqldump({
        connection: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'atricent_live',
        },
        dump: { 
            schema: { table: { dropIfExist: true } } ,
            data: {maxRowsPerInsertStatement: 10,},
            tables: ['sizes', 'brands'],
        },
        // dumpToFile: 'app/data/size_dump.sql.gz',
        // dumpToFile: 'app/data/size_dump.sql',
        dumpToFile: filePath+fileName,
        // compressFile: true,
    }).then((data)=>{
        console.log('DB exported')
        // sql2gzip(filePath, fileName)
        importSQL(filePath, fileName)
    })
    console.log('consoled')
    
    // }




}