
const rxjs = require('rxjs');
const axios = require('axios');
const Stream = require('./stream');
const { Logger } = require('./logger');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;

const host = 'io.adafruit.com';
const port = 8883;


class IncomingStream {

    constructor() {
        this.messageStore = [];
        this.listenerStore = [];
    }

    _getListeneterByRequestId(requestId) {
        return this.listenerStore.filter(listener => listener.requestId === requestId)
    }

    fetchLastData() {
        return axios.get(`https://io.adafruit.com/api/v2/${username}/feeds/${feedIdIn}/data/last`, { headers: { 'X-AIO-Key': key } });
    }

    listen() {
        return rxjs.Observable.create(observer => {
            this.stream.on('message', data => {
                const parsedData = JSON.parse(data.toString('utf8'));
                Logger.info('Received message ' + JSON.stringify(parsedData));
                const parameters = JSON.parse(parsedData.data.value);
                Logger.silly(`Add ${JSON.stringify(parameters.requestId)} to messageStore`);
                this.messageStore.push(parameters);
                observer.next(JSON.parse(parsedData.data.value));
            });
        });
    }

    async _checkData() {
        let response = await this.fetchLastData();
        const message = JSON.parse(response.data.value);
        this._getListeneterByRequestId(message.requestId)
            .forEach(listener => {
                clearInterval(listener.intervalId);
                listener.resolve(message);
            });
    }

    async waitForNextMessage(requestId) {
        return new Promise(async (resolve, reject) => {
            // Check almost immediatly
            setTimeout(async () => await this._checkData(), 100);
            let intervalId = setInterval(async () => await this._checkData(), 400);
            Logger.silly(`Add requestId ${requestId} to listenerStore`);
            this.listenerStore.push({ requestId, resolve, reject, intervalId });
        });

    }
}

module.exports = IncomingStream;


