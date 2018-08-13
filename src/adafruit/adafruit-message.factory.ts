import { Context } from 'koa';
import { AdafruitMessage } from './adafruit-message.interface';
import * as uuidv4 from 'uuid/v4';

export class AdafruitMessageFactory {
    public static fromKoaContext(ctx: Context): AdafruitMessage {
        const requestId = uuidv4();
        const r = ctx.body.queryResult;
        const data = {
            queryText: r.queryText,
            parameters: r.parameters,
            languageCode: r.languageCode
        };
        return { requestId, data };;
    }
}
