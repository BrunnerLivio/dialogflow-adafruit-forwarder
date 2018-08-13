export interface AdafruitConfig {
    username: string;
    key: string;
    feedIdIn: string;
    feedIdOut: string;
    host?: string;
    port?: number;
}

export interface DialogflowAdafruitForwarderConfig {
    adafruit: AdafruitConfig;
    port: number;
    noEmoji: boolean;
    logLevel: string;
}
