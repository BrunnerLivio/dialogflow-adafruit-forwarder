const Axios = require('axios');
const uuidv4 = require('uuid/v4');
const IncomingStream = require('./incoming-stream');
const { logInfo, logSuccess } = require('./logger');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdOut = process.env.ADAFRUIT_FEED_ID_OUT;

const url = `https://io.adafruit.com/api/v2/${username}/feeds/${feedIdOut}/data`;
const stream = new IncomingStream();

const generateMessage = ctx => {
    const requestId = uuidv4();
    const result = ctx.body.queryResult;
    return {
        requestId,
        data: {
            queryText: result.queryText,
            parameters: result.parameters
        }
    };
};

const sendData = async value => {
    const data = await Axios.post(url, { value }, { headers: { 'X-AIO-Key': key } });
    logInfo('Sent data!');
    return data;
};

const forwardMessage = async ctx => {
    let data;
    try {
        data = generateMessage(ctx);
    }
    catch (ex) {
        logError('Invalid data received', ex);
        return ctx.response.res.statusCode = 500;
    }
    const value = JSON.stringify(data);

    logInfo(`Sending data to ${url}. Value: ${value}`);

    try {
        await sendData(value);
    } catch (ex) {
        logError(`Could not send data`, ex);
    }

    logInfo('Waiting for message ' + data.requestId);
    const incomingMessage = await stream.waitForNextMessage(data.requestId);
    logInfo(`Received message ${incomingMessage}`);

    ctx.response.res.statusCode = 200;
    ctx.body = { fulfillmentText: incomingMessage.data };
};

module.exports = {
    async init() {
        await stream.connect();
        return forwardMessage;
    }
};
