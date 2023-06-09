// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { HttpContextBase } from './Interfaces';
export abstract class HttpResult {

    public contentType: string = 'text/html';
    public contentEncoding: string = 'utf8';
    public status: number;

    abstract execute(context: HttpContextBase): Promise<any>;

}
