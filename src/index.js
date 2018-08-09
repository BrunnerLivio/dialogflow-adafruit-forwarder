const Chalk = require('chalk');


const { Logger } = require('./logger');
const Server = require('./server');

const printTitle = require('./printTitle');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const port = process.env.PORT || 3000;

printTitle();

if (!key) return Logger.error('You must set the env variable "ADAFRUIT_KEY"');
if (!username) return Logger.error('You must set the env variable "ADAFRUIT_USERNAME"');

new Server()
    .listen(port)
    .then(() =>
        Logger.info('Try ' + Chalk.blue(`curl -X POST http://localhost:${port}/ -H 'content-type: application/json' -d '{"queryResult": {"queryText": "123123", "parameters": ["1"]}}'`)));


