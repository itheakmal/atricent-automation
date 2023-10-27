// const fs = require("fs").promises;
// const path = require("path");
// const Client = require("ssh2-sftp-client");

// const mergeChunks = async (fileName, totalChunks) => {
//   const chunkDir = path.join(__dirname, "chunks");
//   const mergedFilePath = path.join(__dirname, "merged_files", fileName);

//   const sftp = new Client();

//   try {
//     await sftp.connect({
//       host: "remote-server-hostname",
//       port: "remote-server-port", // Usually 22 for SFTP
//       username: "remote-username",
//       password: "remote-password",
//     });

//     for (let i = 0; i < totalChunks; i++) {
//       const chunkFilePath = path.join(chunkDir, `${fileName}.part_${i}`);
//       const chunkBuffer = await fs.readFile(chunkFilePath);
//       await sftp.put(chunkBuffer, `${mergedFilePath}.part_${i}`);
//       await fs.unlink(chunkFilePath); // Delete the individual chunk file after uploading
//     }

//     console.log("Chunks uploaded successfully");

//     await sftp.end();
//   } catch (error) {
//     console.error("Error uploading chunks:", error);
//     throw error;
//   }
// };

// module.exports = {
//   mergeChunks,
// };








exports.upoloading = () => {
    const fs = require('fs');
    const http = require('http');

    const filePath = 'app/data/size_dump22.sql.gz';
    const url = 'http://localhost:8988/upload';

    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Encoding': 'gzip'
        }
    };

    const fileStream = fs.createReadStream(filePath);
    let chunkIndex = 0;

    fileStream.on('data', (chunk) => {
        const req = http.request(url, options, (res) => {
            console.log(`Chunk ${chunkIndex} uploaded successfully with status code ${res.statusCode}`);
        });

        req.on('error', (err) => {
            console.error(`Error uploading chunk ${chunkIndex}: ${err}`);
        });

        req.write(chunk);
        req.end();

        chunkIndex++;
    });

    fileStream.on('end', () => {
        console.log('File uploaded successfully!');
    });

}
