// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { HttpContextBase } from "./Interfaces";

export class HttpConsumer {
    constructor(public callable: (context: HttpContextBase,...args: any[]) => Promise<any>) {
        //
    }

    /**
     * Executes a callable against a given context
     * @param {HttpContextBase} context
     * @param {...*} args
     */
    run(context: HttpContextBase, ...args: any[]): Promise<any> {
        const argumentsWithContext = [].concat(context, args);
        return this.callable.apply(null, argumentsWithContext);
    }
}
