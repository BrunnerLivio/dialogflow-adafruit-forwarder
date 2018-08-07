
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const Chalk = require('chalk');
const forwardMessage = require('./forward-message');

const { logInfo, logSuccess, logErrorAndExit } = require('./logger');

const printTitle = require('./printTitle');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const port = process.env.PORT || 3000;

printTitle();

const koa = new Koa();
const app = new Router();

app.use(cors());
app.use(bodyParser());
app.use(json());

if (!key) return logErrorAndExit('You must set the env variable "ADAFRUIT_KEY"');
if (!username) return logErrorAndExit('You must set the env variable "ADAFRUIT_USERNAME"');


app.use(async (ctx, next) => {
    ctx.body = ctx.request.body
    await next();
});

app.post('/', forwardMessage);

koa.use(app.routes());
koa.listen(port);
logSuccess(`Listening on port ${Chalk.green(port)}`);
logInfo('Try ' + Chalk.blue(`curl -X POST http://localhost:${port}/ -H 'content-type: application/json' -d '{"queryResult": {"queryText": "123123", "parameters": ["1"]}}'`));
