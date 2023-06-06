import { HttpResult } from './HttpResult';
import { HttpContextBase } from './HttpContext';

// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved

export class HttpRedirectResult extends HttpResult {
    constructor(public url: string) {
        super();
        // set status
        this.status = 302;
    }
    async execute(context: HttpContextBase): Promise<void> {
        // set redirect location
        context.response.writeHead(this.status, { 'Location': this.url });
    }
}
