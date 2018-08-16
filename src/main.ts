import { DialogflowAdafruitForwarderConfig } from './config';
import { WebServer } from './web-server';
import { AdafruitService } from './adafruit';
import * as Figlet from 'figlet';
import { Logger } from './util';

export class DialogflowAdafruitForwarder {
    private webServer: WebServer;
    private adafruitService: AdafruitService;
    constructor(private config: DialogflowAdafruitForwarderConfig) {
        this.adafruitService = new AdafruitService(config.adafruit);
        this.webServer = new WebServer(this.adafruitService);
    }

    private printVersion() {
        const packageJson = require('../package.json');
        Logger.info(`Version ${packageJson.version}`);
    }

    private startingMessage() {
        const text = Figlet.textSync('Dialogflow Adafruit Forwader');
        console.log(text);
        try {
            this.printVersion();
        }
        catch (err) {
            Logger.error('Could not fetch current version:  ' + err.message);
        }
    }

    /**
     * Starts the application
     */
    public async start() {
        this.startingMessage();
        await this.adafruitService.listen();
        await this.webServer.listen(this.config.port, this.config.host || '127.0.0.1');
    }
}
