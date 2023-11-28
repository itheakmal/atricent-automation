const Bull = require('bull');
const { sizeScrapper } = require('../scrapper');


const sizeScrapperQueue = new Bull('size-scrapper-queue', 'redis://127.0.0.1:6379');

sizeScrapperQueue.process(async (job) => {
  try {
    const { link, io, id, num, count, index } = job.data;
    // Call the sizeScrapper function
    const result = await sizeScrapper(link, io, id, num, count, index);
    return result;
  } catch (error) {
    console.error('Error processing sizeScrapperQueue job:', error);
    throw error;
  }
});

module.exports = sizeScrapperQueue;
