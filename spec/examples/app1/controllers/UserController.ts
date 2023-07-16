import { HttpController, HttpParamAttributeOptions, httpController, httpGet } from '@themost/router';
import { Users } from '../data/Users';
const idParam: HttpParamAttributeOptions = {
    name: 'id',
    type: 'Integer',
    required: true
};

@httpController()
class UserController extends HttpController {

    @httpGet({
        name: 'index'
    })
    async getItems(): Promise<any[]> {
        return Users;
    }

    @httpGet({
        name: 'user',
        params: [
            idParam
        ]
    })
    async getItem(id: number): Promise<any> {
        return Users.find((x) => x.id === id);
    }

}

export {
    UserController
}