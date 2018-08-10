export interface AdafruitConfig {
    username: string;
    key: string;
    feedIdIn: string;
    feedIdOut: string;
}

export interface DialogflowAdafruitForwarderConfig {
    adafruit: AdafruitConfig;
    port: number;
    noEmoji: boolean;
    logLevel: string;
}
