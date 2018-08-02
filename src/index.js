const emoji = require('node-emoji');
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const Axios = require('axios');
const bodyParser = require('koa-bodyparser');
const Chalk = require('chalk');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const port = process.env.PORT || 3000;
const noEmoji = process.env.NO_EMOJI || false;
const feedId = process.env.ADAFRUIT_FEED_ID;
if (noEmoji === 'true' || noEmoji === true) emoji.get = () => '';

const printLine = () => {
    for (let i = 0; i < 47; i++) {
        process.stdout.write(emoji.get('coffee') + ' ');
    }
    process.stdout.write('\n');
};

const printTitle = () => {
    process.stdout.write('\n');
    printLine();
    console.log(require('figlet').textSync('Dialogflow Adafruit'));
    printLine();
    process.stdout.write('\n');
};

const logInfo = (...args) => console.log(`${emoji.get('information_source')} ` + args);
const logSuccess = (...args) => console.log(`${emoji.get('rocket')} ` + args);
const logError = (...args) => console.error(`${emoji.get('red_circle')} ` + args);

printTitle();

const koa = new Koa();
const app = new Router();

app.use(cors());
app.use(bodyParser());



if (!key) return console.error('You must set the env variable "ADAFRUIT_KEY"');
if (!username) return console.error('You must set the env variable "ADAFRUIT_USERNAME"');

const url = `https://io.adafruit.com/api/v2/${username}/feeds/${feedId}/data`;

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

    ctx.response.res.statusCode = 200;
});

koa.use(app.routes());
koa.listen(port);
logSuccess(`Listening on port ${Chalk.green(port)}`);
logInfo('Try ' + Chalk.blue(`curl -X POST http://localhost:${port}/ -H 'content-type: application/json' -d '{"query": "123123"}'`));
