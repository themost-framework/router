import { HttpController, httpController, httpGet } from '@themost/router';

@httpController('hello')
export class HelloController extends HttpController {
    constructor() {
        super();
    }
    
    @httpGet({
        name: 'index',
        params: [
            {
                name: 'message',
                maxLength: 512
            }
        ]
    })
    index(message: string) {
        return this.content('Hello World');
    }
}
