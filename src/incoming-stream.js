
const Stream = require('./stream');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;
const rxjs = require('rxjs');
const { Logger } = require('./logger');

const host = 'io.adafruit.com';
const port = 8883;


class IncomingStream {

    constructor() {
        this.connectionRetries = 0;
        this.messageStore = [];
        this.listenerStore = [];
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
            Logger.info(`Message found for ${message.requestId}`);
            this._getListeneterByRequestId(message.requestId)
                .forEach(listener => {
                    listener.resolve(message)
                    Logger.silly(`Remove ${message.requestId} from messageStore`)
                    this.messageStore.splice(index, 1);
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
                resolve()
            });
            this.stream.on('error', message => logError(message));
            this.stream.on('disconnected', async () => {
                Logger.info(`Trying to reconnect. Attempt ${this.connectionRetries + 1}`);
                if (this.connectionRetries < 3) {
                    this.connectionRetries++;
                    await this.connect();
                    this.connectionRetries = 0;
                }
            });
        });
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
        return new Promise((resolve, reject) => {
            Logger.silly(`Add requestId ${requestId} to listenerStore`);
            this.listenerStore.push({ requestId, resolve, reject });
        });

    }
}

module.exports = IncomingStream;


