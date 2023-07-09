import { HttpController, httpGet } from '@themost/router';

export class BaseController extends HttpController {
    @httpGet({
        name: 'version'
    })
    version() {
        return this.json({
            version: 'latest'
        });
    }
}