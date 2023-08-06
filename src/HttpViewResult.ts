import { ViewPathResolver } from './ViewPathResolver';
import { HttpResult } from './HttpResult';
import { HttpRoute } from './HttpRoute';
import { HttpContextBase } from './Interfaces';
import { Request, Response } from 'express-serve-static-core';
import { enumerable } from './decorators';

export class HttpViewContext {
    constructor(private _context: HttpContextBase) {
        //
    }

    @enumerable(false)
    get context(): HttpContextBase {
        return this._context;
    }
}

export class HttpViewResult extends HttpResult {

    [k: string]: any;

    constructor(public data: any) {
        super();
        this.contentType = 'text/html;charset=utf-8';
        this.contentEncoding = 'utf8';
    }

    async execute(context: HttpContextBase): Promise<void> {
        const res = context.response as Response;
        const req = context.request as Request;
        return new Promise((resolve, reject) => {
            const activatedRoute: HttpRoute = req.activatedRoute;
            if (activatedRoute == null) {
                return reject(new Error('Request activated route cannot be empty at this context'));
            }
            let viewPath = null;
            const viewPathResolver = context.application.getService(ViewPathResolver);
            if (viewPathResolver) {
                viewPath = viewPathResolver.resolve(activatedRoute.routeConfig.controller)
            }
            if (viewPath == null) {
                return reject(new Error('View path cannot be determined'));
            }
            if (activatedRoute.params.action) {
                viewPath += '/';
                viewPath += activatedRoute.params.action;
            }
            void res.render(viewPath, {
                html: new HttpViewContext(context),
                model: this.data
            }, (err, html) => {
                if (err) {
                    return reject(err);
                }
                context.response.writeHead(this.statusCode || 200, { 'Content-Type': this.contentType });
                // send response
                context.response.write(html, this.contentEncoding as BufferEncoding);
                return resolve();
            });
        });
    }

}
