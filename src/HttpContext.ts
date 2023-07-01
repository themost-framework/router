// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationBase, ConfigurationBase } from '@themost/common';
import { DefaultDataContext } from '@themost/data';
import { enumerable } from './decorators';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpContextBase } from './Interfaces';

export class HttpContext extends DefaultDataContext implements HttpContextBase {
    protected _application: ApplicationBase;
    protected _req: IncomingMessage;
    protected _res: ServerResponse;
    
    constructor(application: ApplicationBase, req?: IncomingMessage, res?: ServerResponse) {
        // call super constructor
        super();
        // set application
        Object.defineProperty(this, '_application', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: application
        });

        Object.defineProperty(this, '_req', {
            configurable: true,
            enumerable: false,
            get: () => req
        });

        Object.defineProperty(this, '_res', {
            configurable: true,
            enumerable: false,
            get: () => res
        });
    }

    @enumerable(false)
    get request(): IncomingMessage {
        return this._req;
    }

    @enumerable(false)
    get response(): ServerResponse {
        return this._res;
    }

    @enumerable(false)
    get application(): ApplicationBase {
        return this._application;
    }

    public getApplication(): ApplicationBase {
        return this._application;
    }

    public getConfiguration(): ConfigurationBase {
        return this._application.getConfiguration();
    }

}
