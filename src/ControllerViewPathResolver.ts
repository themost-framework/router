import { ApplicationBase, ApplicationService } from '@themost/common';
import { HttpControllerAnnotation } from './HttpDecorators';
import { kebabCase, camelCase } from 'lodash';

abstract class ControllerViewPathResolver extends ApplicationService {

    constructor(app: ApplicationBase) {
        super(app);
    }

    abstract resolve(controllerCtor: new (...args:any[]) => any): string | undefined;
}

class DefaultControllerViewPathResolver extends ControllerViewPathResolver {


    resolve(controllerCtor: new (...args:any[]) => any): string | undefined {
        const controllerAnnotation = controllerCtor as unknown as HttpControllerAnnotation;
        if (controllerAnnotation && controllerAnnotation.httpController) {
            if (controllerAnnotation.httpController.views) {
                return controllerAnnotation.httpController.views;
            }
            // get controller class name
            let name = controllerCtor.name;
            // remove Controller suffix
            const removeControllerSuffix = name.replace(/([_$]+)?Controller$/ig, '');
            if (removeControllerSuffix.length) {
                name =  removeControllerSuffix;
            }
            // return kebab-cased controller name
            // e.g. PasswordReminderController -> password-reminder
            return kebabCase(name);
        }
    }

}

class CamelCaseControllerViewPathResolver extends ControllerViewPathResolver {

    resolve(controllerCtor: new (...args:any[]) => any): string | undefined {
        const controllerAnnotation = controllerCtor as unknown as HttpControllerAnnotation;
        if (controllerAnnotation && controllerAnnotation.httpController) {
            if (controllerAnnotation.httpController.views) {
                return controllerAnnotation.httpController.views;
            }
            // get controller class name
            let name = controllerCtor.name;
            // remove Controller suffix
            const removeControllerSuffix = name.replace(/([_$]+)?Controller$/ig, '');
            if (removeControllerSuffix.length) {
                name =  removeControllerSuffix;
            }
            // return kebab-cased controller name
            // e.g. PasswordReminderController -> password-reminder
            return camelCase(name);
        }
    }

}

export {
    ControllerViewPathResolver,
    DefaultControllerViewPathResolver,
    CamelCaseControllerViewPathResolver
}