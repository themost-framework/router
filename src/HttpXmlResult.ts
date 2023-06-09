import { HttpResult } from './HttpResult';
import { HttpContextBase } from './Interfaces';
import { XSerializer } from '@themost/xml';

export class HttpXmlResult extends HttpResult {
    execute(context: HttpContextBase): Promise<any> {
        if (this.data == null) {
            context.response.writeHead(this.status || 204);
            return;
        }
        // write content-type
        context.response.writeHead(this.status || 200, { 'Content-Type': this.contentType });
        // send response
        context.response.write(XSerializer.serialize(this.data), this.contentEncoding as BufferEncoding);
    }
    constructor(public data: any) {
        super();
        this.contentType = 'utf8';
        this.contentEncoding = 'application/xml';
    }
};
