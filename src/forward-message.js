const Axios = require('axios');
const uuidv4 = require('uuid/v4');
const IncomingStream = require('./incoming-stream');
const { Logger } = require('./logger');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdOut = process.env.ADAFRUIT_FEED_ID_OUT;

const url = `https://io.adafruit.com/api/v2/${username}/feeds/${feedIdOut}/data`;
const stream = new IncomingStream();

const generateMessage = ctx => {
    const requestId = uuidv4();
    const data = ctx.body.queryResult;
    return { requestId, data };
};

const sendData = async value => {
    const data = await Axios.post(url, { value }, { headers: { 'X-AIO-Key': key } });
    Logger.info('Sent data!');
    return data;
};

const forwardMessage = async ctx => {
    let data;
    Logger.debug(`Recevied body ${JSON.stringify(ctx.body)}`);
    try {
        data = generateMessage(ctx);
    }
    catch (ex) {
        Logger.error('Invalid data received', ex);
        return ctx.response.res.statusCode = 500;
    }
    const value = JSON.stringify(data);

    Logger.debug(`Sending data to ${url}. Value: ${value}`);

    try {
        await sendData(value);
    } catch (ex) {
        Logger.error(`Could not send data`, ex);
    }

    Logger.debug('Waiting for message ' + data.requestId);
    const incomingMessage = await stream.waitForNextMessage(data.requestId);
    Logger.info(`Received message ${JSON.stringify(incomingMessage)}`);

    ctx.response.res.statusCode = 200;
    ctx.body = { fulfillmentText: incomingMessage.data };
};

module.exports = {
    async init() {
        await stream.connect();
        return forwardMessage;
    }
};
