import { DialogflowAdafruitForwarder } from './main';
import { DialogflowAdafruitForwarderConfig } from './config';

const env = process.env;

const config: DialogflowAdafruitForwarderConfig = {
    adafruit: {
        feedIdIn: env.ADAFRUIT_FEED_ID_IN,
        feedIdOut: env.ADAFRUIT_FEED_ID_OUT,
        key: env.ADAFRUIT_KEY,
        username: env.ADAFRUIT_USERNAME
    },
    port: parseInt(env.PORT) || 3000,
    noEmoji: env.NO_EMOJI === 'true',
    logLevel: env.LOG_LEVEL
};

const app = new DialogflowAdafruitForwarder(config);
app.start();
