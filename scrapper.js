const runScrapper = async (link) => {
    return new Promise((resolve, reject) => {
        const exec = require('child_process').exec
        const fs = require('fs')
        const moment = require('moment')
        console.log('link', link)
        try {
            const jsonString = JSON.stringify({ link })
            const path = __dirname
            const fileName = `size_${moment().format('HHmmssSS')}.json`
            const filePathName = path + fileName
            fs.writeFileSync(`${fileName}`, jsonString)
            const cmd = `python3 /var/www/atricent-automation/scrappers/update_size.py ${fileName}`
            exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    reject(error)
                    return
                }
                if (stdout) {
                    resolve({ stdout, stderr })
                }
            })
        } catch (error) {
            reject(error)
        }

    })
}
exports.runOrderScrapper = async (address, scrapper, filedName) => {
    return new Promise((resolve, reject) => {
        try {
            const exec = require('child_process').exec;
            const fs = require('fs');
            // const moment = require('moment')

            const jsonString = JSON.stringify(address, null, 2);
            const path = __dirname;
            // const momentFileName = moment().format('HHmmssSS')
            const fileName = `order${filedName}.json`;
            // const returnFileName = `_order${momentFileName}.json`;
            console.log('filename', fileName)
            const filePathName = path + fileName;
            fs.writeFileSync(`${fileName}`, jsonString);
            // const cmd = `python3 /var/www/similar-products/banana_republic.py address=${address}`;
            const cmd = `python3 /var/www/atricent-automation/scrappers/${scrapper}.py ${fileName}`;

            exec(cmd, function (error, stdout, stderr) {
                if (error) {
                    // fs.unlinkSync(filePathName);
                    reject(error);
                    return;
                }

                if (stdout) {
                    // fs.unlinkSync(filePathName);
                    resolve({ stdout, stderr });
                }
            });
        } catch (error) {
            reject(error)
        }

    })
}
exports.deleteGeneratedFile = async (filePath) => {
    const fs = require('fs').promises
    const path = require('path');
    console.log('filePath', filePath)
    // try {
    //     await fs.unlink('/'+filePath);
    //     console.log(`File ${filePath} has been deleted.`);
    // } catch (error) {
    //     console.error(`Error deleting file ${filePath}:`, error);
    // }
    try {
        const filePath = path.resolve(__dirname, fileName); // Assuming the file is in the same directory as this script
        console.log(`filePath ${filePath}`);
        await fs.unlink(filePath);
        console.log(`File ${filePath} has been deleted.`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error(`File not found: ${fileName}`);
        } else {
          console.error(`Error deleting file ${fileName}:`, error);
        }
      }
}

const readFile = async (file, id) => {
    const fs = require('fs').promises
    const filed = file.trim()
    console.log('file', filed)
    try {
        const data = await fs.readFile(`./${filed}`, 'utf-8')
        const parsedData = JSON.parse(data)
        // console.log('readFile data: ', parsedData)
        const temp = parsedData.map(ps => {

            const sample = ps.size_elements ? JSON.stringify(ps.size_elements) : ps.size_elements
            return { ...ps, size_elements: sample }
        })
        //  console.log('num, count, index', num, count, index)
        // io.emit('sizeUpdate', {data: temp, id: id})
        return ({ parsedData, sizeUpdate: { data: temp, id: id } })
    } catch (error) {
        throw error
    }
}
exports.readOrderFile = async (file, io) => {
    const fs = require('fs').promises;
    // const filed = file.replace(/\r\n/g, '');
    const filed = file.trim().split(',');


    try {
        // console.log('sails.config.local', sails.config);
        const data = []
        for (let file of filed) {

            const temp = await fs.readFile(`./${file}`, 'utf-8');
            if (temp !== null) {
                data.push(JSON.parse(temp))
            } else {
                data.push(temp)

            }
        }
        // this emit is commented
        // io.emit("testOne", data);
        // console.log('User service data', data);
        return data;
    } catch (err) {
        throw err;
    }
}

exports.sizeScrapper = (link, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout, stderr } = await runScrapper(link)
            const size = await readFile(stdout, id)
            await deleteGeneratedFile(stdout)
            resolve(size)
        } catch (error) {
            reject(error)
        }
    })
}
exports.orderScrapper = (data, file, socket) => {
    return new Promise(async (resolve, reject) => {
        try {
            const moment = require('moment')
            const momentFileName = moment().format('HHmmssSS')
            appIO.socket.on('orderScrapper', function (data) {
                const asyncTask = runOrderScrapper(data.cartItem, data.scrapper, momentFileName)
                asyncTask.then((data) => {
                    console.log('Async task has completed', data);
                    console.log('Async task has completed', data.stdout);
                    console.log('Async task has completed', data.stdout.trim());

                }).catch((error) => {
                    console.error('Async task encountered an error:', error);
                });
                // console.log('message from atricent-automation console:', data);
                // console.log('appIO.socket.id:', appIO.socket.id);
            });

            // console.log('Before calling async function');
            // const asyncTask = runOrderScrapper(data, file, momentFileName)
            // console.log('After calling async function');
            // asyncTask.then((data) => {
            //     console.log('Async task has completed', data);
            // }).catch((error) => {
            //     console.error('Async task encountered an error:', error);
            // });


            // const { stdout, stderr } = await runOrderScrapper(data, file. momentFileName)
            console.log('momentFileName', momentFileName);

            // const order = await readOrderFile(stdout)
            // console.log('order', JSON.stringify(order))
            resolve(momentFileName)
        } catch (error) {
            reject(error)
        }
    })
}
