import {TestController} from './TestController';
import {HttpControllerAnnotation} from '@themost/router';

describe('HttpController', () => {
    it('should has controller decorator', () => {
       const controller  = new TestController();
       const annotation = controller.constructor as HttpControllerAnnotation;
       expect(annotation.httpController).toBeTruthy()
    });
    it('should has controller method decorator', () => {
        const annotation = TestController as unknown as HttpControllerAnnotation;
        const methodAnnotation = annotation.httpMethods.get('hello');
        expect(methodAnnotation).toBeTruthy();
        expect(methodAnnotation.httpGet).toBeTruthy();
    });
});

