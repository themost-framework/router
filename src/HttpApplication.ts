import { ConfigurationBase, SequentialEventEmitter, Args } from '@themost/common';
import {HttpApplicationBase, ApplicationServiceConstructor} from './Interfaces';
import { RouterService } from './RouterService';
import { HttpController } from './HttpController';
import { HttpControllerAnnotation } from './HttpDecorators';
import { resolve } from 'path';
import { DataConfigurationStrategy } from '@themost/data';
import { ResponseFormatService } from './ResponseFormatService';

export class HttpApplication extends SequentialEventEmitter implements HttpApplicationBase {
    private readonly _configuration: ConfigurationBase;
    private services: Map<string, any> = new Map();
    private controllers: Map<string, any> = new Map();
    public container: any;

    constructor(cwd?: string) {
        super();
        // set configuration
        let _cwd = cwd || process.cwd();
        this._configuration = new ConfigurationBase(resolve(_cwd, 'config'));
        // use data configuration strategy (for implenting validators)
        this.configuration.useStrategy(DataConfigurationStrategy)
        // use router service
        this.useService(RouterService);
        this.useService(ResponseFormatService)
    }

    /**
     * Gets application configuration
     */
    public get configuration(): ConfigurationBase {
        return this._configuration
    }

    /**
     * Registers an application service of the given type by defining an alternate type as constructor of the given service.
     * Use this operation to extend or override application service functionality.
     * @param serviceCtor
     * @param strategyCtor
     */
    useStrategy(serviceCtor: ApplicationServiceConstructor<any>, strategyCtor: ApplicationServiceConstructor<any>): this {
        Args.notNull(serviceCtor, 'Service constructor');
        Args.notNull(strategyCtor, 'Strategy constructor');
        const Strategy = strategyCtor as any;
        this.services.set(serviceCtor.name, new Strategy(this));
        return this;
    }

    /**
     * Registers an application service
     * @param serviceCtor An application service to register
     */
    useService(serviceCtor: ApplicationServiceConstructor<any>): this {
        Args.notNull(serviceCtor, 'Service constructor');
        const Service = serviceCtor as any;
        this.services.set(serviceCtor.name, new Service());
        return this;
    }

    /**
     * Returns true if the current application has a service of the given type
     * @param serviceCtor An application service to search for
     */
    hasService(serviceCtor: ApplicationServiceConstructor<any>): boolean {
        Args.notNull(serviceCtor, 'Service constructor');
        return this.services.has(serviceCtor.name);
    }

    /**
     * Gets an application service of the given type
     * @param serviceCtor The type of service to get
     */
    getService<T>(serviceCtor: ApplicationServiceConstructor<T>): T {
        Args.notNull(serviceCtor, 'Service constructor');
        return this.services.get(serviceCtor.name);
    }

    /**
     * Gets application configuration
     */
    getConfiguration(): ConfigurationBase {
        return this._configuration;
    }

    use(controllerConstructor: new() => HttpController) {
        const Controller = controllerConstructor as unknown;
        const annotation = Controller as HttpControllerAnnotation;
        this.controllers.set(annotation.name, controllerConstructor);
    }

}

