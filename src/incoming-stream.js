
const Stream = require('./stream');
const username = process.env.ADAFRUIT_USERNAME;
const key = process.env.ADAFRUIT_KEY;
const feedIdIn = process.env.ADAFRUIT_FEED_ID_IN;
const rxjs = require('rxjs');

const host = 'io.adafruit.com';
const port = 8883;



class IncomingStream {
    constructor() {
        this.stream = new Stream({
            type: 'feeds',
            username,
            key,
            host,
            port
        });
    }

    connect() {
        this.stream.connect(feedIdIn);
    }

    onMessage() {
        return rxjs.Observable.create(observer => {
            this.stream.on('message', data => {
                const parsedData = JSON.parse(data.toString('utf8'));
                observer.next(parsedData.data.value);
            });
        });
    }

    async waitForNextMessage() {
        return new Promise((resolve, reject) => {
            const observ = this.onMessage();
            observ.subscribe(data => {
                resolve(data);
            });
        });

    }
}

module.exports = IncomingStream;


