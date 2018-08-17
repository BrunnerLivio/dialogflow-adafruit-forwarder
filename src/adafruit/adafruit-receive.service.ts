import { AdafruitConfig } from '../config';
import { Stream, Logger } from '../util';
import Chalk from 'chalk';
import { Observable, Observer } from 'rxjs';
import { IncomingAdafruitMessage } from './adafruit-message.interface';
import { TimeoutError } from '../errors/timeout.error';
import { AdafruitMQTTService } from './adafruit-mqtt.service';

const TIMEOUT = 20 * 1000;

interface Listener {
    requestId: string;
    timestamp: Date;
    resolve: Function;
    reject: Function;
}

export class AdafruitReceiveService {
    private adafruit: AdafruitMQTTService;
    private messageStore: IncomingAdafruitMessage[] = new Array<IncomingAdafruitMessage>();
    private listenerStore: Listener[] = new Array<Listener>();

    constructor(private config: AdafruitConfig) {
        this.adafruit = new AdafruitMQTTService(this.config);
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
                listener.resolve(JSON.parse(message));
                this.removeMessage(message.requestId, index);
                this.removeListener(listener.requestId, listenerIndex);
            } else if (message && liftetime > TIMEOUT) {
                Logger.error(`Reject ${Chalk.cyan(message.requestId)} after TIMEOUT ${Chalk.red(liftetime.toString())}ms`)
                listener.reject(new TimeoutError());
                this.removeMessage(message.requestId, index);
                this.removeListener(listener.requestId, listenerIndex);
            }
        });
    }

    private onMessage(message: IncomingAdafruitMessage) {
        Logger.silly('Calling AdafruitReceiveService.onMessage');
        const storedMessage = this.getMessageByRequestId(message.requestId);
        if (!storedMessage.message) {
            this.registerMessage(message);
        }
        this.checkResolveableListeners();
    }

    public async listen() {
        if (!this.adafruit.isConnected()) {
            await this.adafruit.connect();
            await this.adafruit.onMessage().subscribe(message => this.onMessage(message));
        }

    }

    public async listenForNextRequestId(requestId: string): Promise<any | IncomingAdafruitMessage> {
        await this.listen();
        return new Promise((resolve, reject) => this.registerListener({ requestId, timestamp: new Date(), resolve, reject }));
    }
}
