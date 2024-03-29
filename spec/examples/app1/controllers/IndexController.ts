import { HttpController, httpController, httpGet } from '@themost/router';
import { BaseController } from './BaseController';

@httpController({
    name: 'index'
})
export class IndexController extends BaseController {

    @httpGet()
    index() {
        return this.view({
            message: 'Hello World!'
        });
    }

}