import {Handler, Router} from 'express';
import { HttpController } from './HttpController';
import { HttpResult } from './HttpResult';
import { HttpNextResult } from './HttpNextResult';
import { HttpControllerMethodAnnotation } from './HttpDecorators';
import {capitalize} from 'lodash';
import { ApplicationBase, LangUtils } from '@themost/common';
import { RouterService } from './RouterService';
import { HttpRoute } from './HttpRoute'; 
import { HttpContextBase } from './Interfaces';
import { HttpContext } from './HttpContext';
import { HttpApplication } from './HttpApplication';


declare global {
    namespace Express {
        interface Request {
            context: HttpContextBase;
        }
    }
}

function contextHandler(app: ApplicationBase): Handler {
    return function(req , res, next) {
        try {
            // if request context has been already defined
            if (req.context == null) {
                const context = new HttpContext(app, req, res);
                Object.defineProperty(req, 'context', {
                    configurable: true,
                    enumerable: false,
                    get: () => context
                });
            }
            if ((req.context instanceof HttpContext) === false) {
                // reset request
                Object.defineProperty(req.context, 'request', {
                    configurable: true,
                    enumerable: false,
                    get: () => req
                });
                // reset response
                Object.defineProperty(req.context, 'response', {
                    configurable: true,
                    enumerable: false,
                    get: () => res
                });
                // reset application
                Object.defineProperty(req.context, 'application', {
                    configurable: true,
                    enumerable: false,
                    get: () => app
                });
            }
            // subscribe for end event
            req.on('end', () => {
                if (req.context != null) {
                    if (typeof req.context.finalize === 'function') {
                        // finalize
                        req.context.finalize(() => {
                            // do nothing
                        });
                    }
                }
            });
            return next();
        } catch (error) {
            return next(error);
        }
    }
}

function controllerRouter(app?: ApplicationBase): Router {
    const router = Router();
    let application = app;
    if (application == null) {
        application = new HttpApplication();
    }
    router.use(contextHandler(application));
    router.use((req, res, next) => {
        const appRouter: RouterService = req.context.application.getService(RouterService);
        const route: HttpRoute = appRouter.parseUrl(req.url);
        if (route) {
            const ControllerCtor = route.routeConfig.controller as new() => HttpController;
            const controller = new ControllerCtor();
            controller.context = req.context;
            const action = route.params.action || route.routeConfig.action;
            const controllerMethod: (...arg: any) => any = controller[action];
            if (typeof controllerMethod === 'function') {
                // validate httpAction
                const annotation = controllerMethod as HttpControllerMethodAnnotation;
                // get full method name e.g. httpGet, httpPost, httpPut etc
                const method = `http${capitalize(req.method)}`;
                // if controller method has been annotated
                if (Object.prototype.hasOwnProperty.call(annotation, method)) {
                    const args: any[] = [];
                    // parse method arguments
                    const methodParams = LangUtils.getFunctionParams(controllerMethod);
                    methodParams.forEach((methodParam: string) => {
                        if (Object.prototype.hasOwnProperty.call(route.params, methodParam)) {
                            args.push(route.params[methodParam]);
                        } else if (Object.prototype.hasOwnProperty.call(req.body, methodParam)) {
                            args.push(req.body[methodParam]);
                        } else {
                            args.push(undefined);
                        }
                    });
                    const result = controllerMethod.apply(controller, args);
                    if (result instanceof HttpNextResult) {
                        return next;
                    }
                    if (result instanceof HttpResult) {
                        return result.execute(controller.context).then(() => {
                            if (controller.context.response.writableEnded === false) {
                                controller.context.response.end();
                            }
                        }).catch((err) => {
                            return next(err);
                        });
                    }
                }
            }
        }
        return next();
    });
    return router;
}

export {
    controllerRouter
}
