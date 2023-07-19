// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { type } from 'os';
import { HttpContextBase } from "./Interfaces";

export type ConsumerFunction = (context: HttpContextBase,...args: any[]) => Promise<void>;

export class HttpConsumer {
    constructor(public callable: ConsumerFunction) {
        //
    }

    /**
     * Executes a callable against a given context
     * @param {HttpContextBase} context
     * @param {...*} args
     */
    run(context: HttpContextBase, ...args: any[]): Promise<void> {
        const argumentsWithContext = [].concat(context, args);
        return this.callable.apply(null, argumentsWithContext);
    }
}
