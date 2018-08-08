const Chalk = require('chalk');


const { logErrorAndExit, logInfo } = require('./logger');
const Server = require('./server');

const printTitle = require('./printTitle');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const port = process.env.PORT || 3000;

printTitle();

if (!key) return logErrorAndExit('You must set the env variable "ADAFRUIT_KEY"');
if (!username) return logErrorAndExit('You must set the env variable "ADAFRUIT_USERNAME"');

new Server()
    .listen(port)
    .then(() =>
        logInfo('Try ' + Chalk.blue(`curl -X POST http://localhost:${port}/ -H 'content-type: application/json' -d '{"queryResult": {"queryText": "123123", "parameters": ["1"]}}'`)));


