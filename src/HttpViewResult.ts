import { ControllerViewPathResolver } from './ControllerViewPathResolver';
import { HttpControllerAnnotation } from './HttpDecorators';
import { HttpResult } from './HttpResult';
import { HttpRoute } from './HttpRoute';
import { HttpContextBase } from './Interfaces';
import { Request, Response } from 'express-serve-static-core';


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
            const controllerAnnotation = activatedRoute.routeConfig.controller as HttpControllerAnnotation;
            let viewPath = null;
            const viewPathResolver = context.application.getService(ControllerViewPathResolver);
            if (viewPathResolver) {
                viewPath = viewPathResolver.resolve(activatedRoute.routeConfig.controller)
            }
            if (viewPath == null) {
                return reject(new Error('View path cannot be determined'));
            }
            void res.render(viewPath, this.data, (err, html) => {
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
