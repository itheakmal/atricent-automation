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
            schema: { table: { dropIfExist: true } },
            data: { maxRowsPerInsertStatement: 10, },
            tables: ['sizes', 'brands'],
        },
        // dumpToFile: 'app/data/size_dump.sql.gz',
        // dumpToFile: 'app/data/size_dump.sql',
        dumpToFile: filePath + fileName,
        // compressFile: true,
    }).then((data) => {
        console.log('DB exported')
        // sql2gzip(filePath, fileName)
        // importSQL(filePath, fileName)
        const parser = require('node-sql-parser');
        const fs = require('fs');

        // Read the SQL file
        const sql = fs.readFileSync(filePath + fileName, 'utf8');

        // Parse the SQL file
        const ast = parser.parse(sql);

        // Modify the table names in the AST
        ast.stmt.forEach((stmt) => {
            if (stmt.table.table === 'sizes') {
                stmt.table.table = 'sizes_1';
            } else if (stmt.table.table === 'variations') {
                stmt.table.table = 'variations_1';
            }
        });

        // Generate the modified SQL
        const modifiedSql = parser.stringify(ast);
        const newFileName = fileName.split('.')[0] + '_1.sql'
        console.log('newFileName')
        // Write the modified SQL to a new file
        fs.writeFileSync(filePath + newFileName, modifiedSql);
        console.log('WriteFileSync is done!');






    })
    console.log('consoled')

    // }




}