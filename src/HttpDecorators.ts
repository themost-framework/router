// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {TraceUtils, LangUtils, HttpBadRequestError, HttpUnauthorizedError, Args, Types} from '@themost/common';
import {ConsumerFunction, HttpConsumer} from './HttpConsumer';
import {DataTypeValidator, MinLengthValidator, MaxLengthValidator,
MinValueValidator, MaxValueValidator, RequiredValidator, PatternValidator, DataContext} from '@themost/data';
import {HttpRouteConfig} from './HttpRoute';
import { camelCase } from 'lodash';

class DecoratorError extends Error {
    constructor(msg?: string) {
        super(msg || 'Decorator is not valid on this declaration type.');
    }
}


function httpController(options?: { name?: string, views?: string}): ClassDecorator {
    return (target: any) => {
        Args.check(typeof target === 'function', new DecoratorError());
        // define controller name
        let name = options && options.name;
        let views = options && options.views;
        if (name == null) {
            // try to resolve name from class
            const removeControllerWord = target.name.replace(/([_$]+)?Controller$/ig, '');
            if (removeControllerWord.length) {
                name =  removeControllerWord;
            }
        }
        Object.defineProperty(target, 'httpController', {
            value: {
                name,
                views
            },
            configurable: false,
            enumerable: true,
            writable: true
        });
    }
}

declare type AnyConstructor<T> = Function & { prototype: T };

declare interface HttpControllerMethodDeclaration {
    httpGet?: boolean;
    httpPost?: boolean;
    httpPut?: boolean;
    httpPatch?: boolean;
    httpDelete?: boolean;
    httpHead?: boolean;
    httpOptions?: boolean;
}

declare interface HttpParamAttributeOptions {
    name: string;
    type?: Types | AnyConstructor<any>;
    pattern?: RegExp|string;
    minValue?: any;
    maxValue?: any;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    message?: string;
    fromBody?: boolean;
    fromQuery?: boolean;
}

declare interface HttpControllerMethodAnnotation extends HttpControllerMethodDeclaration {
    httpAction?: string;
    httpParams?: {
        [k: string]: HttpParamAttributeOptions
    }
    httpConsumers?: HttpConsumer[]
}

declare interface HttpControllerAnnotation extends Function {
    httpController: { name: string };
    httpMethods: Map<string, HttpControllerMethodAnnotation>
}

function httpMethod(method: HttpControllerMethodDeclaration,
    extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return (target: any, key: any, descriptor: any) => {
        if (typeof descriptor.value === 'function') {
            // get name or method name
            const name = (extras && extras.name) || key;
            // use action decorator
            httpAction(name)(target, key, descriptor);
            // get controller annotation
            const controllerAnnotation = target.constructor as HttpControllerAnnotation;
            const methodAnnotation = controllerAnnotation.httpMethods.get(key);
            Object.assign(methodAnnotation, method);
            if (extras) {
                // define http params
                if (Array.isArray(extras.params)) {
                    for (const param of extras.params) {
                        httpParam(param)(target, key, descriptor);
                    }
                }
            }
        }
        return descriptor;
    }
}

function httpGet(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpGet: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpAny(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpGet: true,
        httpOptions: true,
        httpHead: true,
        httpDelete: true,
        httpPatch: true,
        httpPost: true,
        httpPut: true
    }, extras);
}

function httpPost(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPost: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpPatch(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPatch: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpPut(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpPut: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpDelete(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpDelete: true,
        httpOptions: true,
        httpHead: true
    }, extras);
}

function httpOptions(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpOptions: true
    }, extras);
}

function httpHead(extras?: { name?: string, params?: HttpParamAttributeOptions[] }) {
    return httpMethod({
        httpHead: true
    }, extras);
}

function httpAction(name: string) {
    if (typeof name !== 'string') {
        throw new TypeError('Action name must be a string');
    }
    return (target: any, key: any, descriptor: any) => {
        if (Object.prototype.hasOwnProperty.call(target.constructor, 'httpMethods') === false) {
            Object.assign(target.constructor, {
                httpMethods: new Map<string, HttpControllerMethodAnnotation>()
            });
        }
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        const controllerAnnotation = target.constructor as HttpControllerAnnotation;
        if (controllerAnnotation.httpMethods == null) {
            controllerAnnotation.httpMethods = new Map();
        }
        let methodAnnotation = controllerAnnotation.httpMethods.get(key);
        if (methodAnnotation == null) {
            controllerAnnotation.httpMethods.set(key, {
                httpAction: name
            });
            methodAnnotation = controllerAnnotation.httpMethods.get(key);
        } else {
            methodAnnotation.httpAction = name
        }
        // assign param validation consumer
        methodAnnotation.httpConsumers = methodAnnotation.httpConsumers || [];
        const paramValidationConsumer = new HttpConsumer(async (context) => {
            const httpParamValidationFailedCallback = (thisContext: any, thisParam: any, validationResult: any) => {
                TraceUtils.error(JSON.stringify(Object.assign(validationResult, {
                    param : thisParam,
                    request : {
                        url: thisContext.request.url,
                        method: thisContext.request.method
                    }
                })));
                return Promise.reject(new HttpBadRequestError('Bad request parameter', thisParam.message || validationResult.message));
            };
            const methodParams = LangUtils.getFunctionParams(descriptor.value);
            const controllerAnnotation1 = target.constructor as HttpControllerAnnotation;
            const methodAnnotation1 = controllerAnnotation1.httpMethods.get(key);
            const httpParams = methodAnnotation1.httpParams;
            // get activated controller
            const activatedController = context.request.activatedController;
            if (methodParams.length>0) {
                let k = 0
                let httpParamItem;
                let validator;
                let validationResult;
                let functionParam;
                let param;
                while (k < methodParams.length) {
                    functionParam = methodParams[k];
                    param = activatedController.args[k];
                    if (httpParams) {
                        httpParamItem = httpParams[functionParam];
                        if (httpParamItem) {
                            if (typeof httpParamItem.type === 'string') {
                                // validate type
                                validator = new DataTypeValidator(httpParamItem.type);
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                            if (httpParamItem.pattern instanceof RegExp) {
                                // validate pattern
                                if (httpParamItem.pattern instanceof RegExp) {
                                    validator = new PatternValidator(httpParamItem.pattern.source);
                                } else {
                                    validator = new PatternValidator(httpParamItem.pattern);
                                }
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                            if (typeof httpParamItem.minLength === 'number') {
                                // validate min length
                                validator = new MinLengthValidator(httpParamItem.minLength);
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                            if (typeof httpParamItem.maxLength === 'number') {
                                // validate max length
                                validator = new MaxLengthValidator(httpParamItem.maxLength);
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                            if (typeof httpParamItem.minValue !== 'undefined') {
                                // validate min value
                                validator = new MinValueValidator(httpParamItem.minValue);
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                            if (typeof httpParamItem.maxValue !== 'undefined') {
                                // validate max value
                                validator = new MaxValueValidator(httpParamItem.required);
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }

                            if ((typeof httpParamItem.required !== 'undefined') && (httpParamItem.required === true)) {
                                // validate required value
                                validator = new RequiredValidator();
                                validator.setContext(context as any);
                                validationResult = validator.validateSync(param);
                                if (validationResult) {
                                    return httpParamValidationFailedCallback(context, httpParamItem, validationResult);
                                }
                            }
                        }
                    }
                    k += 1;
                }
            }
            return Promise.resolve();
        });
        if (methodAnnotation.httpConsumers.findIndex((consumer) => consumer === paramValidationConsumer) < 0) {
            methodAnnotation.httpConsumers.push(paramValidationConsumer);
        }
        return descriptor;
    }
}

function httpParam(options: HttpParamAttributeOptions) {
    if (typeof options !== 'object') { throw new TypeError('Parameter options must be an object'); }
    if (typeof options.name !== 'string') { throw new TypeError('Parameter name must be a string'); }
    return (target: any, key: any, descriptor: any) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        // get controller annotation
        const controllerAnnotation = target.constructor as HttpControllerAnnotation;
        if (controllerAnnotation.httpMethods == null) {
            controllerAnnotation.httpMethods = new Map();
        }
        let methodAnnotation: HttpControllerMethodAnnotation = controllerAnnotation.httpMethods.get(key);
        if (methodAnnotation == null) {
            const httpAction = key
            const httpParams: {
                [k: string]: HttpParamAttributeOptions
            } = {};
            httpParams[options.name] = Object.assign({
                'type':'Text'
            }, options);
            methodAnnotation = {
                httpAction,
                httpParams
            }
        } else {
            methodAnnotation.httpParams = methodAnnotation.httpParams || {};
            methodAnnotation.httpParams[options.name] = Object.assign({
                'type':'Text'
            }, options);
        }
        return descriptor;
    }
}

function httpAuthorize(value?: boolean) {
    return (target: any, key: any, descriptor: any) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        httpActionConsumer(new HttpConsumer((context) => {
            if (context.user && context.user.name !== 'anonymous') {
                return Promise.resolve();
            }
            return Promise.reject(new HttpUnauthorizedError());
        }))(target, key, descriptor);
        return descriptor;
    };
}

function httpActionConsumer(consumer: HttpConsumer | ConsumerFunction) {
    return (target: any, key: any, descriptor: any) => {
        if (typeof descriptor.value !== 'function') {
            throw new Error('Decorator is not valid on this declaration type.');
        }
        const controllerAnnotation = target.constructor as HttpControllerAnnotation;
        if (controllerAnnotation.httpMethods == null) {
            controllerAnnotation.httpMethods = new Map();
        }
        let methodAnnotation = controllerAnnotation.httpMethods.get(key);
        if (methodAnnotation == null) {
            methodAnnotation = {
                httpAction: key,
                httpConsumers: []
            }
            controllerAnnotation.httpMethods.set(key, methodAnnotation);
        }
        methodAnnotation.httpConsumers = methodAnnotation.httpConsumers || [];
        if (consumer instanceof HttpConsumer) {
            // set consumer
            methodAnnotation.httpConsumers.push(consumer);
            // and exit
            return descriptor;
        }
        // validate consumer function
        if (typeof consumer !== 'function') {
            throw new Error('Consumer may be a function.');
        }
        methodAnnotation.httpConsumers.push(new HttpConsumer(consumer));
        return descriptor;
    };
}

/**
 * Defines an http route that is going to be registered by an http controller
 */
function httpRoute(url: string, index?: number) {
    return (target: any, key: any, descriptor: any) => {
        if (typeof descriptor.value === 'function') {
            Object.defineProperty(descriptor.value, 'httpRoute', {
                get () {
                    const route: HttpRouteConfig = {
                        path: url,
                        controller: target.httpControllerName || target.name,
                        action: descriptor.value.httpAction
                    };
                    if (descriptor.value.hasOwnProperty('httpAny') === false) {
                        // set httpHead if does not exists
                        if (descriptor.value.hasOwnProperty('httpHead') === false) {
                            descriptor.value.httpHead = true;
                        }
                        // set httpOptions if does not exists
                        if (descriptor.value.hasOwnProperty('httpOptions') === false) {
                            descriptor.value.httpOptions = true;
                        }
                        // enumerate http methods and format allow attribute
                        const allowString = [
                            'httpGet',
                            'httpHead',
                            'httpOptions',
                            'httpPost',
                            'httpPut',
                            'httpDelete',
                            'httpPatch' ].filter( (httpKey) => {
                            return descriptor.value.hasOwnProperty(httpKey) && descriptor.value[httpKey];
                        }).map((httpKey) => {
                            return httpKey.replace(/^http/,'').toUpperCase();
                        }).join(',');
                        // set allow attribute
                        Object.assign(route, {
                            allow: allowString
                        });
                    }
                    return route;
                },
                configurable: false,
                enumerable: true
            });
            // set route index
            Object.defineProperty(descriptor.value, 'httpRouteIndex', {
                value: index || 0
            });
        }
        return descriptor;
    }
}

export {
    DecoratorError,
    AnyConstructor,
    HttpParamAttributeOptions,
    HttpControllerAnnotation,
    HttpControllerMethodAnnotation,
    httpGet,
    httpAny,
    httpPost,
    httpPut,
    httpPatch,
    httpDelete,
    httpOptions,
    httpHead,
    httpAction,
    httpRoute,
    httpController,
    httpParam,
    httpAuthorize,
    httpActionConsumer
}
