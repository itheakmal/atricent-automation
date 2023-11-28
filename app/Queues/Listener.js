const { consumer } = require("./Consumer")


exports.listener = () => {
    const process = consumer()
    return new Promise( (resolve, reject) => {
        // spawn the process here
        let stdout = '';
        let stderr = '';
        process.on('close', async (code, signal) => {
            console.log('process closed')
            resolve(code)
        })
        process.stderr.on('data', async (data) => {
            console.log('js erro=>', data.toString())
            reject(data);
        })
        process.stdout.on('data', (data) => {
            console.log('js data=>', data.toString())
        })
        
    })
}