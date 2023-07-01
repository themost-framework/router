// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { HttpResult } from './HttpResult';
import { HttpContextBase } from './Interfaces';

export class HttpNextResult extends HttpResult {
    async execute(_context: HttpContextBase): Promise<void> {
        // do nothing
        return;
    }

}
