// const { producer } = require("./Producer")



exports.consumer = async (cartQueue) => {
    // const cartQueue = producer()
    const jobs = []
    jobs.push(cartQueue.process((job)=>{
        console.log('job', job)
        console.log('job.data', job.data)
        // run the scrapper from here
        // await sizeScrapper()
    }))
    return jobs
}