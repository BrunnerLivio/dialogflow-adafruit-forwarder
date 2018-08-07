
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const json = require('koa-json');
const Axios = require('axios');
const bodyParser = require('koa-bodyparser');
const emoji = require('node-emoji');
const Chalk = require('chalk');
const printTitle = require('./printTitle');
const IncomingStream = require('./incoming-stream');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const port = process.env.PORT || 3000;
const feedIdOut = process.env.ADAFRUIT_FEED_ID_OUT;

const logInfo = (...args) => console.log(`${emoji.get('information_source')} ` + args);
const logSuccess = (...args) => console.log(`${emoji.get('rocket')} ` + args);
const logError = (...args) => console.error(`${emoji.get('red_circle')} ` + args);

printTitle();

const koa = new Koa();
const app = new Router();

app.use(cors());
app.use(bodyParser());
app.use(json());

if (!key) return console.error('You must set the env variable "ADAFRUIT_KEY"');
if (!username) return console.error('You must set the env variable "ADAFRUIT_USERNAME"');

const url = `https://io.adafruit.com/api/v2/${username}/feeds/${feedIdOut}/data`;


const stream = new IncomingStream();
logInfo(`Connecting to stream`);
stream.connect();

app.use(async (ctx, next) => {
    ctx.body = ctx.request.body
    await next();
});

app.post('/', async ctx => {
    let data;
    try {
        const result = ctx.body.queryResult;
        data = { queryText: result.queryText, parameters: result.parameters };
    }
    catch (ex) {
        logError('Invalid data received', ex);
        return ctx.response.res.statusCode = 500;
    }
    const value = JSON.stringify(data);
    logInfo(`Sending data to ${url}. Value: ${value}`);
    try {
        await Axios.post(url, { value }, { headers: { 'X-AIO-Key': key } });
        logInfo('Sent data!');
    } catch (ex) {
        logError(`Could not send data`, ex);
    }
    logInfo('Waiting for message');
    const message = await stream.waitForNextMessage();
    logInfo(`Received message ${message}`);
    ctx.response.res.statusCode = 200;
    ctx.body = { fulfillmentText: message };

});

koa.use(app.routes());
koa.listen(port);
logSuccess(`Listening on port ${Chalk.green(port)}`);
logInfo('Try ' + Chalk.blue(`curl -X POST http://localhost:${port}/ -H 'content-type: application/json' -d '{"query": "123123"}'`));
