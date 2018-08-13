import * as Koa from 'koa';
import * as cors from '@koa/cors';
import * as Router from 'koa-router';
import * as json from 'koa-json';
import * as bodyParser from 'koa-bodyparser';
import Chalk from 'chalk';
import { Logger } from '../util';
import { AdafruitService } from '../adafruit';
import { AdafruitMessageFactory } from '../adafruit/adafruit-message.factory';
import { InvalidDataReceived } from '../errors/invalid-data-received.error';
import { AdafruitMessage } from '../adafruit/adafruit-message.interface';

export class WebServer {
    private koa: Koa;
    private app: Router;

    constructor(private adafruitService: AdafruitService) {
        this.koa = new Koa();
        this.app = new Router();

        this.app.use(cors());
        this.app.use(bodyParser());
        this.app.use(json());

        this.app.use(async (ctx, next) => {
            ctx.body = ctx.request.body
            await next();
        });
        this.app.use(async (ctx, next) => {
            try {
                await next();
            } catch (err) {
                Logger.error('Uncaught error: ' + err.message);
                ctx.status = err.status || 500;
                ctx.body = err.message;
                ctx.app.emit('error', err, ctx);
            }
        });
    }

    private async forwardMessage(ctx: Koa.Context) {
        Logger.debug(`Recevied body ${Chalk.blueBright(JSON.stringify(ctx.body))}`);
        let msg: AdafruitMessage;
        try {
            msg = AdafruitMessageFactory.fromKoaContext(ctx);
        } catch (err) {
            Logger.error(err);
            throw new InvalidDataReceived();
        }
        await this.adafruitService.send(msg);
        const message = await this.adafruitService.listenForNextRequestId(msg.requestId);
        const body = { fulfillmentText: message.data };
        Logger.silly(`Sending HTTP body ${JSON.stringify(body)}`);
        ctx.body = body;

    }

    public async listen(port) {
        this.app.post('/', async ctx => await this.forwardMessage(ctx));

        this.koa.use(this.app.routes());
        this.koa.listen(port);
        Logger.info(`Listening on port ${Chalk.green(port)}`);

    }
}
