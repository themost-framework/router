// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { ApplicationBase, ConfigurationBase } from '@themost/common';
import { DefaultDataContext } from '@themost/data';
import { enumerable } from './decorators';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpContextBase } from './Interfaces';

export class HttpContext extends DefaultDataContext implements HttpContextBase {
    request: IncomingMessage;
    response: ServerResponse;
    private _application: ApplicationBase;
    
    constructor(application: ApplicationBase) {
        // call super constructor
        super();
        // set application
        Object.defineProperty(this, '_application', {
            configurable: true,
            enumerable: false,
            writable: false,
            value: application
        });
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
