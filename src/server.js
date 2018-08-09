
const Koa = require('koa');
const cors = require('@koa/cors');
const Router = require('koa-router');
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const Chalk = require('chalk');

const forwardMessage = require('./forward-message');
const { Logger } = require('./logger');




class Server {
    async _bootstrap() {
        this.koa = new Koa();
        this.app = new Router();

        this.app.use(cors());
        this.app.use(bodyParser());
        this.app.use(json());

        this.app.use(async (ctx, next) => {
            ctx.body = ctx.request.body
            await next();
        });
    }
    async listen(port) {
        await this._bootstrap();
        const forwarder = await forwardMessage.init();
        this.app.post('/', forwarder);

        this.koa.use(this.app.routes());
        this.koa.listen(port);
        Logger.info(`Listening on port ${Chalk.green(port)}`);

    }
}

module.exports = Server;
