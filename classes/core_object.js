/*
 @author Zakai Hamilton
 @component CoreObject
 */

class CoreObject {
    constructor() {
        this._attachments = [];
        this._parent = null;
        this._holdCount = 0;
    }
    static init() {
        console.log("init: " + this.name);
    }
    static config() {

    }
    attach(component) {
        let instance = this.cast(component);
        if (instance) {
            return instance;
        }
        instance = new component();
        const parent = this._parent || this;
        parent._attachments.push(instance);
        instance._parent = parent;
        return instance;
    }
    detach() {
        const parent = this._parent || this;
        this._parent = null;
        parent._attachments = parent._attachments.filter(item => item !== this);
        if (parent === this) {
            const first = parent._attachments[0];
            if (first) {
                first._attachments = parent._attachments;
                parent._attachments = null;
            }
        }
    }
    cast(component) {
        if (this.constructor.name === component.name) {
            return this;
        }
        const parent = this._parent || this;
        const instance = parent._attachments.find(item => item.constructor.name === component.name);
        return instance;
    }
    hold() {
        const parent = this._parent || this;
        parent._holdCount++;
    }
    release() {
        const parent = this._parent || this;
        if (parent._holdCount) {
            parent._holdCount--;
            return false;
        }
        let attachments = Array.from(parent._attachments);
        for (let attachment of attachments) {
            attachment.detach();
        }
        return true;
    }
}

class CoreTest extends CoreObject {
    constructor() {
        super();
    }
}

component.register([CoreObject, CoreTest]);
