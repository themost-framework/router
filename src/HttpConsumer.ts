// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpContextBase} from './HttpContext';

export class HttpConsumer {
    constructor(public callable: (this: HttpContextBase,...args: any[]) => Promise<any>) {
        //
    }

    /**
     * Executes a callable against a given context
     * @param {HttpContextBase} context
     * @param {...*} args
     */
    run(context: HttpContextBase, ...args: any[]): Promise<any> {
        return this.callable.apply(context, args);
    }
}
