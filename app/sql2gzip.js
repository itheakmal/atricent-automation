exports.sql2gzip = async (filePath, fileName) => {
    var zlib = require('zlib');
    var fs = require('fs');

    var gzip = zlib.createGzip();
    // 'app/data/size_dump.sql'
    var r = fs.createReadStream(`${filePath}${fileName}`);
    var w = fs.createWriteStream(`${filePath}${fileName}.gz`);
    r.pipe(gzip).pipe(w);
}