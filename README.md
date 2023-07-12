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

## @httpController

Annotates a class which is going to be used as controller.


Create an instance of `HttpApplication`, add `routes` collection and register `controllerRouter` middleware:

    const app = express();
    app.use(express.json());
    ...
    const httpApp = new HttpApplication();
    const routes: HttpRouteConfig[] = [
        {
            path: '',
            action: 'index',
            controller: IndexController
        },
        ...
    ];
    httpApp.getService(RouterService).addRange(...routes);
    app.use(controllerRouter(httpApp));

 