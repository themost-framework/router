// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import { HttpContextBase } from './Interfaces';
import { HttpResult } from './HttpResult';
import { PassThrough, Stream } from 'stream';

function bufferToStream(input: Buffer | Stream) {
    if (input instanceof Stream) {
        return input;
    }
    const stream = new PassThrough();
    stream.push(input);
    stream.push(null);
    return stream;
}

export class HttpContentResult extends HttpResult {

    public contentType: string = 'text/html';
    public contentEncoding: string = 'utf8';

    constructor(public content: any) {
        super();
    }

    async execute(context: HttpContextBase): Promise<any> {
        if (this.content == null) {
            context.response.writeHead(this.status || 204);
            return;
        }
        // write content-type
        context.response.writeHead(this.status || 200, { 'Content-Type': this.contentType });
        if (this.contentEncoding === 'binary') {
            return await new Promise<void>((resolve, reject) => {
                const source = bufferToStream(this.content);
                source.on('end', () => {
                    return resolve();
                });
                source.on('error', (err) => {
                    return reject(err);
                });
                return source.pipe(context.response);
            });
        }
        // send response
        context.response.write(this.content, this.contentEncoding as BufferEncoding);
    }

}
