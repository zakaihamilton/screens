/*
 @author Zakai Hamilton
 @component CoreObject
 */

class CoreObject {
    constructor() {
        this.associations = [];
        this.parent = null;
    }
    static init() {

    }
    static _config() {

    }
    attach(component) {
        let instance = this.cast(component);
        if (instance) {
            return instance;
        }
        instance = new component();
        const parent = this.parent || this;
        parent.associations.push(instance);
        instance.parent = parent;
        return instance;
    }
    detach(component) {
        let instance = this.cast(component);
        if (!instance) {
            return null;
        }
        const parent = this.parent || this;
        instance.parent = null;
        parent.associations = parent.associations.filter(item => item !== instance);
        return instance;
    }
    cast(component) {
        if (this.constructor.name === component.name) {
            return this;
        }
        const parent = this.parent || this;
        const instance = parent.associations.find(item => item.constructor.name === component.name);
        return instance;
    }
}

class CoreTest extends CoreObject {
    constructor() {
        super();
    }
}

screens.register([CoreObject, CoreTest]);
