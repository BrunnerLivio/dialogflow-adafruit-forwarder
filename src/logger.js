const emoji = require('node-emoji');

const logInfo = (...args) => console.log(`${emoji.get('information_source')} ` + args);
const logSuccess = (...args) => console.log(`${emoji.get('rocket')} ` + args);
const logError = (...args) => console.error(`${emoji.get('red_circle')} ` + args);
const logErrorAndExit = (...args) => {
    logError(...args);
    process.exit(1);
};

module.exports = { logInfo, logSuccess, logError, logErrorAndExit };
