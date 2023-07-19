import {Handler, Router} from 'express';
import { HttpController } from './HttpController';
import { HttpResult } from './HttpResult';
import { HttpNextResult } from './HttpNextResult';
import { HttpControllerMethodAnnotation, HttpParamAttributeOptions, HttpControllerAnnotation } from './HttpDecorators';
import {capitalize} from 'lodash';
import { ApplicationBase, HttpError, HttpNotAcceptableError, LangUtils } from '@themost/common';
import { RouterService } from './RouterService';
import { HttpRoute } from './HttpRoute'; 
import { HttpContextBase } from './Interfaces';
import { HttpContext } from './HttpContext';
import { HttpApplication } from './HttpApplication';
import '@themost/promise-sequence';
import { ResponseFormatService } from './ResponseFormatService';

declare global {
    namespace Express {
        interface Request {
            context: HttpContextBase;
            activatedRoute?: HttpRoute;
            activatedController?: {
                controller: HttpControllerAnnotation,
                method: HttpControllerMethodAnnotation,
                args: any[]
            }
        }
    }
}

function isPromise(value: any) {
    return (typeof value.then === 'function') && (typeof value.catch === 'function');
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

function getControllerMethod(ctor: any, action: string): { 
    [k: string]: HttpControllerMethodAnnotation
} | undefined {

    const controllerAnnotation = ctor as unknown as HttpControllerAnnotation;
    let methodAnnotation: HttpControllerMethodAnnotation;
    const methods = controllerAnnotation.httpMethods;
    let method: string;
    if (methods) {
        for (let [key, value] of methods) {
            if (value.httpAction === action) {
                method = key;
                methodAnnotation = value;
                break;
            }
        }
    }
    if (methodAnnotation == null) {
        const superCtor = Object.getPrototypeOf(ctor);
        if (superCtor) {
            return getControllerMethod(superCtor, action);
        }
    }
    if (method == null) {
        return;
    }
    const result: { [k:string] : HttpControllerMethodAnnotation } = {};
    result[method] = methodAnnotation;
    return result;
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
            // set activatedRoute
            Object.defineProperty(req, 'activatedRoute', {
                configurable: true,
                enumerable: true,
                get: () => route
            });
            const ControllerCtor = route.routeConfig.controller as new() => HttpController;
            const controller = new ControllerCtor();
            controller.context = req.context;
            const action = route.params.action || route.routeConfig.action;
            
            const controllerAnnotation = ControllerCtor as unknown as HttpControllerAnnotation;
            let methodAnnotation: HttpControllerMethodAnnotation;
            let controllerMethod: (...arg: any) => any;
            const findControllerMethod = getControllerMethod(ControllerCtor, action);
            if (findControllerMethod) {
                const keys = Object.keys(findControllerMethod);
                controllerMethod = controller[keys[0]];
                methodAnnotation = findControllerMethod[keys[0]];
            }
            if (typeof controllerMethod === 'function') {
                // get full method name e.g. httpGet, httpPost, httpPut etc
                const method = `http${capitalize(req.method)}`;
                // if controller method has been annotated
                if (Object.prototype.hasOwnProperty.call(methodAnnotation, method)) {
                    const args: any[] = [];
                    // parse method arguments
                    const methodParams = LangUtils.getFunctionParams(controllerMethod);
                    methodParams.forEach((methodParam: string) => {
                        // get http param
                        let httpParam: HttpParamAttributeOptions | undefined;
                        if (methodAnnotation.httpParams && Object.prototype.hasOwnProperty.call(methodAnnotation.httpParams, methodParam)) {
                            httpParam = methodAnnotation.httpParams[methodParam];
                        }
                        if (httpParam == null) {
                            // set default param for further processing
                            httpParam = {
                                name: methodParam,
                                fromBody: false,
                                fromQuery: false
                            }
                        }
                        // stage #1 get parameter from Request.body
                        if (httpParam && httpParam.fromBody) {
                            // set param from request body
                            if (Object.keys(req.body).length === 0) {
                                args.push(null);
                            } else {
                                args.push(req.body);
                            }
                            
                            // exit
                            return;
                        }
                        // stage #2 get parameter from Request.query
                        if (httpParam && httpParam.fromQuery) {
                            // set param from request query
                            if (Object.prototype.hasOwnProperty.call(req.query, httpParam.name)) {
                                args.push(req.query[httpParam.name]);
                            } else {
                                args.push(undefined);
                            }
                            return;
                        }
                        // stage #3 get parameter from Request.route
                        if (Object.prototype.hasOwnProperty.call(route.params, httpParam.name)) {
                            // set param from route
                            args.push(route.params[httpParam.name]);
                            // and exit
                            return;
                        }
                        // stage #4 get parameter from Request.body[property]
                        const body = req.body;
                        if (Object.prototype.hasOwnProperty.call(body, httpParam.name)) {
                            // set param from route
                            args.push(body[httpParam.name]);
                            // and exit
                            return;
                        }
                        args.push(undefined);

                    });
                    // set activated controller
                    const activatedController = {
                        controller: controllerAnnotation,
                        method: methodAnnotation,
                        args: args
                    };

                    Object.defineProperty(req, 'activatedController', {
                        configurable: true,
                        enumerable: true,
                        get: () => activatedController
                    });

                    // execute action consumers
                    const consumers = methodAnnotation.httpConsumers || [];
                    const consumerSequence = consumers.map((consumer) => {
                        return () => {
                            return consumer.run(controller.context)
                        }
                    });
                    return Promise.sequence(consumerSequence).then(() => {
                        const result = controllerMethod.apply(controller, args);
                        if (result instanceof HttpNextResult) {
                            return next();
                        }
                        if (result instanceof HttpResult) {
                            return result.execute(controller.context).then(() => {
                                if (controller.context.response.writableEnded === false) {
                                    controller.context.response.end();
                                }
                            }).catch((err) => {
                                return next(err);
                            });
                        } else if (isPromise(result)) {
                            // format result
                            return result.then((data: any) => {
                                 const formatService = controller.context.application.getService(ResponseFormatService);
                                 if (formatService == null) {
                                    throw new Error('ResponseFormatService cannot be null at this context');
                                 }
                                 return formatService.tryExecuteFormatter(controller.context, data).then(() => {
                                    if (controller.context.response.writableEnded === false) {
                                        controller.context.response.end();
                                    }
                                 });
                            }).catch((err: Error) => {
                                return next(err);
                            });
                        }
                        throw new HttpError(415)
                    }).catch((err) => {
                        return next(err);
                    });
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
