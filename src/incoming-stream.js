
const rxjs = require('rxjs');
const axios = require('axios');
const Stream = require('./stream');
const { Logger } = require('./logger');

const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;
const key = process.env.ADAFRUIT_KEY;

const host = 'io.adafruit.com';
const port = 8883;


class IncomingStream {

    constructor() {
        this.messageStore = [];
        this.listenerStore = [];
        this._initializeStream();
    }

    _initializeStream() {
        const settings = {
            type: 'feeds',
            username,
            key,
            host,
            port,
            id: feedIdIn
        };
        Logger.silly('Initializing Incoming Stream', settings);
        this.stream = new Stream(settings);
    }

    _getListeneterByRequestId(requestId) {
        return this.listenerStore.filter(listener => listener.requestId === requestId)
    }

    _emitToListeners() {
        this.messageStore.forEach((message, index) => {
            this._getListeneterByRequestId(message.requestId)
                .forEach(listener => {
                    Logger.silly(`Found ${message.requestId} in messageStore and remove it now`);
                    this.messageStore.splice(index, 1);
                    listener.resolve(message)
                });
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.stream.connect();
            this.stream.on('connected', () => {
                Logger.info(`Connected to stream`);
                Logger.info(`Listening to message`);
                this.listen().subscribe(() => this._emitToListeners());;
                resolve();
            });
            this.stream.on('error', message => Logger.error(message));
        });
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

    async waitForNextMessage(requestId) {
        return new Promise(async (resolve, reject) => {
            this._initializeStream();
            await this.connect();
            Logger.silly(`Add requestId ${requestId} to listenerStore`);
            this.listenerStore.push({ requestId, resolve, reject });
            setInterval(async () => console.log(await this.fetchLastData()), 1000);
        });

    }
}

module.exports = IncomingStream;


