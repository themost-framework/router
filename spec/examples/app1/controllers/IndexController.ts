import { HttpController, httpController, httpGet } from "@themost/router";

@httpController('index')
export class IndexController extends HttpController {

    @httpGet()
    index() {
        return this.view({
            message: 'Hello World!'
        });
    }

}