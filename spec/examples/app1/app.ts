import * as express from 'express';
import {controllerRouter, HttpApplication, HttpRoute, HttpRouteConfig, RouterService, xml} from '@themost/router';
import { HelloController } from './controllers/HelloController';
import { ViewEngine } from '@themost/ejs';
import * as path from 'path';
import { IndexController } from './controllers/IndexController';


const app = express();

app.use(express.json());

// set ejs engine
app.engine('ejs', ViewEngine.express());
app.set('view engine', 'ejs');
// resolve views root path
app.set('views', path.resolve(__dirname, './views'));

// app.use(xml())

const service = new HttpApplication();

const routes: HttpRouteConfig[] = [
    {
        path: '',
        action: 'index',
        controller: IndexController
    },
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

