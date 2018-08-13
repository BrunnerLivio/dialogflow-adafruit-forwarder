import { AdafruitConfig } from '../config';
import { Stream, Logger } from '../util';
import Chalk from 'chalk';
import { Observable, Observer } from 'rxjs';
import { IncomingAdafruitMessage } from './adafruit-message.interface';
import { TimeoutError } from '../errors/timeout.error';

const TIMEOUT = 20 * 1000;

interface Listener {
    requestId: string;
    timestamp: Date;
    resolve: Function;
    reject: Function;
}

export class AdafruitReceiveService {
    private stream: Stream;
    private connected = false;
    private messageStore: IncomingAdafruitMessage[] = new Array<IncomingAdafruitMessage>();
    private listenerStore: Listener[] = new Array<Listener>();

    constructor(private config: AdafruitConfig) {
        const { key, username, feedIdIn } = this.config;
        this.stream = new Stream({ username, key, type: 'feeds', id: feedIdIn });
    }

    private getMessageByRequestId(requestId): { message: IncomingAdafruitMessage, index: number } {
        const condition = message => message.requestId === requestId;
        const message = this.messageStore.find(condition);
        const index = this.messageStore.findIndex(condition);
        return { message, index };
    }

    private registerListener(data: Listener) {
        this.listenerStore.push(data);
        Logger.silly(`Adding Listener with ${Chalk.cyan(data.requestId)}. ${this.listenerStore.length} Listeners left in Memory store.`);
    }

    private registerMessage(message: IncomingAdafruitMessage) {
        this.messageStore.push(message);
        Logger.silly(`Adding Message with ${Chalk.cyan(message.requestId)}. ${this.messageStore.length} Messages left in Memory Store.`);
    }

    private removeListener(requestId: string, index: number) {
        this.listenerStore.splice(index, 1);
        Logger.silly(`Removing Listener with ${Chalk.cyan(requestId)}. ${this.listenerStore.length} Listeners left in Memory store.`);
    }

    private removeMessage(requestId: string, index: number) {
        this.messageStore.splice(index, 1);
        Logger.silly(`Removing Message with ${Chalk.cyan(requestId)}. ${this.messageStore.length} Messages left in Memory Store.`);
    }

    private checkResolveableListeners() {
        this.listenerStore.forEach((listener, listenerIndex) => {
            const { message, index } = this.getMessageByRequestId(listener.requestId);
            const liftetime = new Date().getTime() - listener.timestamp.getTime();
            if (message) {
                Logger.info(`Received Message ${Chalk.cyan(message.requestId)} after ${Chalk.green(liftetime.toString())}ms`);
                listener.resolve(message);
                this.removeMessage(message.requestId, index);
                this.removeListener(listener.requestId, listenerIndex);
            } else if (liftetime > TIMEOUT) {
                Logger.error(`Reject ${Chalk.cyan(message.requestId)} after TIMEOUT ${Chalk.red(liftetime.toString())}ms`)
                listener.reject(new TimeoutError());
                this.removeMessage(message.requestId, index);
                this.removeListener(listener.requestId, listenerIndex);
            }
        });
    }

    private onMessage(data: Buffer) {
        const rawMessage = data.toString('utf8')
        Logger.silly(`Received raw message: ${rawMessage}`);
        const parsedData = JSON.parse(rawMessage);
        const message = JSON.parse(parsedData.data.value) as IncomingAdafruitMessage;
        this.registerMessage(message);
        this.checkResolveableListeners();
    }

    private subscribeToEvents(): void {
        Logger.silly('Subscribing to "message" event');
        this.stream.on('message', msg => this.onMessage(msg));
        this.stream.on('disconnected', msg => Logger.error('Discconnected ' + msg));
        this.stream.on('error', msg => Logger.error('Error ' + msg));
    }

    private async connect() {
        return new Promise(resolve => {
            if (this.connected) {
                return resolve();
            }
            this.stream.connect();
            this.subscribeToEvents();
            this.stream.on('connected', (host, port) => {
                this.connected = true;
                Logger.info(`Established connection to server ${Chalk.blue(`${host}:${port}`)}`);
                return resolve();
            });
        });
    }

    public async listen() {
        await this.connect();
    }

    public async listenForNextRequestId(requestId: string): Promise<any | IncomingAdafruitMessage> {
        await this.listen();
        return new Promise((resolve, reject) => this.registerListener({ requestId, timestamp: new Date(), resolve, reject }));
    }
}
