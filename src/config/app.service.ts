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
    host?: string;
    noEmoji: boolean;
    logLevel: string;
}
