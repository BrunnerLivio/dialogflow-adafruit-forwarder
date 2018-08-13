import { DialogflowAdafruitForwarderConfig } from './config';
import { WebServer } from './web-server';
import { AdafruitService } from './adafruit';

export class DialogflowAdafruitForwarder {
    private webServer: WebServer;
    private adafruitService: AdafruitService;
    constructor(private config: DialogflowAdafruitForwarderConfig) {
        this.adafruitService = new AdafruitService(config.adafruit);
        this.webServer = new WebServer(this.adafruitService);
    }

    /**
     * Starts the application
     */
    public async start() {
        await this.adafruitService.listen();
        await this.webServer.listen(this.config.port);
    }
}
