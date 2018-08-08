
const Stream = require('./stream');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;
const rxjs = require('rxjs');
const { logInfo, logSuccess, logErrorAndExit } = require('./logger');

const host = 'io.adafruit.com';
const port = 8883;



class IncomingStream {
    messageStore = [];
    listenerStore = [];
    constructor() {
        this.stream = new Stream({
            type: 'feeds',
            username,
            key,
            host,
            port,
            id: feedIdIn
        });
    }

    _getListeneterByRequestId(requestId) {
        this.listenerStore.filter(listener => listener.requestId === requestId)
    }

    _emitToListeners() {
        this.messageStore.forEach((message, index) => {
            logInfo(`Message found for ${message.requestId}`);
            this._getListeneterByRequestId(message.requestId)
                .resolve(message);
            this.messageStore.splice(index, 1);
        });
    }

    connect() {
        this.stream.connect();
        this.listen().subscribe(() => this._emitToListeners());;
    }

    listen() {
        return rxjs.Observable.create(observer => {
            this.stream.on('message', data => {
                const parsedData = JSON.parse(data.toString('utf8'));
                logInfo('Received message ' + JSON.stringify(parsedData));
                this.messageStore.push(JSON.parse(parsedData.data.value));
                observer.next(JSON.parse(parsedData.data.value));
            });
        });
    }

    async waitForNextMessage(requestId) {
        return new Promise((resolve, reject) => {
            this.listenerStore.push({ requestId, resolve, reject });
        });

    }
}

module.exports = IncomingStream;


