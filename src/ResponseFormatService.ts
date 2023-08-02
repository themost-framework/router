import { ApplicationBase, ApplicationService } from '@themost/common';
import { HttpResult } from './HttpResult';
import { HttpJsonResult } from './HttpJsonResult';
import { HttpViewResult } from './HttpViewResult';
import { HttpContextBase } from './Interfaces';
const accepts = require('accepts');

class ResponseFormatService extends ApplicationService {
    public formatters = new Map<string, new(...args: any) => HttpResult>();
    constructor(app: ApplicationBase) {
        super(app);
        // add default formatter
        this.formatters.set('default', HttpJsonResult);
        // add extra formatters
        this.formatters.set('application/json', HttpJsonResult); // json
        this.formatters.set('text/html', HttpViewResult); // html
    }

    tryGetFormatter(context: HttpContextBase, data: any) {
        const accept = accepts(context.request);
        const keys = Array.from(this.formatters.keys());
        const type = accept.type(keys);
        let FormatterCtor : new(...args: any) => HttpResult;
        if (typeof type === 'string') {
            FormatterCtor = this.formatters.get(type);
            return new FormatterCtor(data);
        }
        // get default formatter
        FormatterCtor = this.formatters.get('default');
        if (FormatterCtor == null) {
            throw new Error('Default formatter cannot be empty at this context');
        }
        return new FormatterCtor(data);
    }

    tryExecuteFormatter(context: HttpContextBase, data: any): Promise<any> {
        const formatter = this.tryGetFormatter(context, data);
        return formatter.execute(context);
    }

}

export {
    ResponseFormatService
}