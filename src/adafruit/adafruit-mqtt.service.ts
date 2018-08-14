import { Observable } from 'rxjs';
import { Stream, Logger } from '../util';
import { AdafruitConfig } from '../config';
import Chalk from 'chalk';
import { IncomingAdafruitMessage } from './adafruit-message.interface';

export class AdafruitMQTTService {
    private stream: Stream;
    private connected = false;
    constructor(private config: AdafruitConfig) {
        const { key, username, feedIdIn } = this.config;
        this.stream = new Stream({ username, key, type: 'feeds', id: feedIdIn });
    }

    private subscribeToEvents(): void {
        Logger.silly('Subscribing to "disconnected" event');
        this.stream.on('disconnected', (host, port) => Logger.error('Discconnected'));
        Logger.silly('Subscribing to "error" event');
        this.stream.on('error', msg => Logger.error('Error ' + msg));
    }

    public onMessage(): Observable<IncomingAdafruitMessage> {
        return Observable.create(observer => {
            this.stream.on('message', data => {
                const rawMessage = data.toString('utf8');
                const parsedData = JSON.parse(rawMessage);
                const message = JSON.parse(parsedData.data.value) as IncomingAdafruitMessage;
                Logger.silly(`Received raw message: ${rawMessage}`);
                observer.next(message);
            });
        });
    }

    public async connect() {
        return new Promise(resolve => {
            if (this.connected) {
                return resolve();
            }
            this.subscribeToEvents();
            this.stream.connect();
            this.stream.on('connected', (host, port) => {
                this.connected = true;
                Logger.info(`Established connection to server ${Chalk.blue(`${host}:${port}`)}`);
                return resolve();
            });
        });
    }

    public isConnected(): boolean {
        return this.connected;
    }

}
