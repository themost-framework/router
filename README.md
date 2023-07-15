# @themost/router
Router service for express.js

## Install

    npm i @themost/router

## Usage

`RouterService` service provides a different approach for handling requests by using
controllers. A controller is an instance of `HttpController` class which uses [javascript decorators](https://github.com/tc39/proposal-decorators) for defining extra attributes in both
classes and methods. 

    import { HttpController, httpController, httpGet } from '@themost/router';
    
    @httpController()
    export class IndexController extends BaseController {

        @httpGet()
        index() {
            return this.json({
                message: 'Hello World!'
            });
        }

    }

`IndexController` is marked by `@httpController` class decorator and `IndexController.index()` by `@httpGet` method decorator.

Create an instance of `HttpApplication` class and register `controllerRouter` express.js middleware:

    const app = express();
    app.use(express.json());
    ...
    const httpApp = new HttpApplication();
    const routes = [
        {
            path: '',
            action: 'index',
            controller: IndexController
        },
        ...
    ];
    httpApp.getService(RouterService).addRange(...routes);
    app.use(controllerRouter(httpApp));

## @httpController

Annotates a class which is going to be used as controller

## @httpGet(name,params)

A method decorator which defines an HTTP GET method

> name: string

A string which represents the name of the method while executing HTTP requests. This name is being used by routing service while parsing routes which contain `:action` param:

    {
        path: 'home',
        controller: HelloController,
        children: [
            {
                path: '',
                redirectTo: 'index'
            },
            {
                path: ':action'
            }
        ]
    }

> params : HttpParamAttributeOptions[]

An array of objects which represents a collection of route or querystring params

    @httpGet({
        params: [
            {
                name: 'id',
                type: 'Integer',
                required: true
            }
        ]
    })
    getItem(id) {
        //
    }

 ## @httpPost(name,params)

A method decorator which defines an HTTP POST method

    @httpPost({
        name: 'reply',
        params: [
            {
                name: 'message',
                type: 'Text',
                maxLength: 512
            }
        ]
    })
    reply(message) {
        //
    }

## @httpPut(name,params)

A method decorator which defines an HTTP PUT method

> name: string

A string which represents the name of the method while executing HTTP requests. This name is being used by routing service while parsing routes which contain `:action` param:

> params : HttpParamAttributeOptions[]

    // e.g. PUT /api/items

    @httpPut({
        params: [
            {
                name: 'item',
                fromBody: true,
                required: true
            }
        ]
    })
    update(item) {
        //
    }

An array of objects which represents a collection of route or querystring params

## @httpDelete(name,params)

A method decorator which defines an HTTP DELETE method

> name: string

A string which represents the name of the method while executing HTTP requests. This name is being used by routing service while parsing routes which contain `:action` param:

> params : HttpParamAttributeOptions[]

An array of objects which represents a collection of route or querystring params

    // e.g. DELETE /api/items/:id

    @httpDelete({
        params: [
            {
                name: 'id',
                required: true
            }
        ]
    })
    remove(id) {
        // remove item by id
    }