import * as express from 'express';
import {controllerRouter, HttpApplication, HttpRoute, HttpRouteConfig, RouterService} from '@themost/router';
import { HelloController } from './controllers/HelloController';

const app = express();

app.use(express.json());

const service = new HttpApplication();

const routes: HttpRouteConfig[] = [
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
]

service.getService(RouterService).addRange(...routes)

app.use(controllerRouter(service));

export {
    app
}

