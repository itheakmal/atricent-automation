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
            const cmd = `python3 ../size_scrapper/update_size.py ${fileName}`
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
const runOrderScrapper = async (address, scrapper) => {
    return new Promise((resolve, reject) => {
        try {
            const exec = require('child_process').exec;
            const fs = require('fs');
        const moment = require('moment')

            const jsonString = JSON.stringify(address, null, 2);
            const path = __dirname;
            const fileName = `order${moment().format('HHmmssSS')}.json`;
            console.log('filename', fileName)
            const filePathName = path + fileName;
            fs.writeFileSync(`${fileName}`, jsonString);
            // const cmd = `python3 /var/www/similar-products/banana_republic.py address=${address}`;
            const cmd = `python3 /size_scrapper/${scrapper}.py ${fileName}`;

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

const readFile = async (file) => {
    const fs = require('fs').promises
    const filed = file.trim()
    console.log('file', filed)
    try {
        const data = await fs.readFile(`./${filed}`, 'utf-8')
        return JSON.parse(data)
    } catch (error) {
        throw error
    }
}
const readOrderFile = async (file) => {
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
        // console.log('User service data', data);
        return data;
    } catch (err) {
        throw err;
    }
}

exports.sizeScrapper = (link) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout, stderr } = await runScrapper(link)
            const size = await readFile(stdout)
            resolve(size)
        } catch (error) {
            reject(error)
        }
    })
}
exports.orderScrapper = (data, file) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { stdout, stderr } = await runOrderScrapper(data, file)
            
            const order = await readOrderFile(stdout)
            console.log('order', JSON.stringify(order))
            resolve(order)
        } catch (error) {
            reject(error)
        }
    })
}
