import { AdafruitSendService } from './adafruit-send.service';
import { AdafruitReceiveService } from './adafruit-receive.service';
import { AdafruitConfig } from '../config';
import { AdafruitMessage } from './adafruit-message.interface';

export class AdafruitService {
    private sendService: AdafruitSendService;
    private receiveService: AdafruitReceiveService;
    constructor(private config: AdafruitConfig) {
        this.sendService = new AdafruitSendService(config);
        this.receiveService = new AdafruitReceiveService(config);
    }

    public async send(msg: AdafruitMessage) {
        return await this.sendService.send(msg);
    }
}
