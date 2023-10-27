const { exportSQL } = require("./exportSQL");

exports.cronJob = () => {
  const schedule = require('node-schedule');

  const moment = require("moment")
  // const { mergeChunks } = require("./uploadHandler");
  schedule.scheduleJob('0 * * * * *', async function () {
  // cron.schedule("0 * * * * *", async () => {
    const fileName = moment().format('DhhmmssS')+'.sql'
    const filePath = 'app/data/'
    console.log('fileName + filePath', filePath + fileName)
    await exportSQL(filePath, fileName)

    // start uploading



    // Run the mergeChunks function every hour (change the cron pattern as needed)
    // try {
    //   const filesToMerge = fs.readdirSync(__dirname + "/chunks");
    //   for (const fileName of filesToMerge) {
    //     const totalChunks = 
    //     await mergeChunks(fileName, totalChunks);
    //     console.log(`File ${fileName} merged successfully`);
    //   }
    // } catch (error) {
    //   console.error("Error merging chunks:", error);
    // }
  });
}
