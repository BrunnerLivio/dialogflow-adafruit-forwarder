import Chalk from 'chalk';
import axios from 'axios';

import { AdafruitConfig } from '../config';
import { AdafruitMessage } from './adafruit-message.interface';
import { Logger } from '../util';

export class AdafruitSendService {
    private url: string;
    constructor(private config: AdafruitConfig) {
        this.url = `https://io.adafruit.com/api/v2/${config.username}/feeds/${config.feedIdOut}/data`;
    }

    public async send(msg: AdafruitMessage) {
        const value = JSON.stringify(msg);
        Logger.debug(`Sending message with id ${Chalk.cyan(msg.requestId)} and value ${Chalk.blueBright(value)}`);
        return await axios.post(this.url, { value }, { headers: { 'X-AIO-Key': this.config.key } });
    }
}
