import { HttpContext } from './HttpContext'
import { HttpJsonResult } from './HttpJsonResult';
import { HttpXmlResult } from './HttpXmlResult';
import { HttpContentResult } from './HttpContentResult';
import { HttpRedirectResult } from './HttpRedirectResult';

// MOST Web Framework Codename ZeroGravity, copyright 2017-2020 THEMOST LP all rights reserved
class HttpController {
    public context: HttpContext;
    [k: string]: any;
    constructor() {
        //
    }

    json(data: any) {
        return new HttpJsonResult(data);
    }

    xml(data: any) {
        return new HttpXmlResult(data);
    }

    content(content: string) {
        return new HttpContentResult(content);
    }

    redirect(url: string) {
        return new HttpRedirectResult(url);
    }

}

export {
    HttpController
}
