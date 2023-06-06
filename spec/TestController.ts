// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
import {HttpController, httpController, httpGet} from '@themost/router';
@httpController('test')
class TestController extends HttpController {
    constructor() {
        super();
    }
    @httpGet()
    hello() {
        return 'Hello World';
    }
}

export {
    TestController
}
