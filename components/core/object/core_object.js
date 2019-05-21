COMPONENT.CoreObject = class {
    static config() {
        return {};
    }
    static init() {

    }
    static start(me) {

    }
    constructor(parent) {
        this._attachments = [];
        this._parent = parent;
        if (parent) {
            parent._attachments.push(this);
        }
        this.package = COMPONENT;
        this._holdCount = 0;
    }
    attach(component) {
        if (!component) {
            return null;
        }
        let instance = this.cast(component);
        if (instance) {
            return instance;
        }
        const parent = this._parent || this;
        instance = new component(parent);
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
        if (!component) {
            return null;
        }
        if (this.constructor.name === component.constructor.name) {
            return this;
        }
        const parent = this._parent || this;
        if (parent instanceof component) {
            return parent;
        }
        const instance = parent._attachments.find(item => item instanceof component);
        return instance;
    }
    hold() {
        const parent = this._parent || this;
        parent._holdCount++;
    }
    async release() {
        const parent = this._parent || this;
        if (parent._holdCount) {
            parent._holdCount--;
            return false;
        }
        let attachments = Array.from(parent._attachments);
        for (let attachment of attachments) {
            await attachment.detach();
        }
        return true;
    }
    send(method, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        const parent = this._parent || this;
        let list = [parent, ...parent._attachments];
        let results = [];
        list.map(item => {
            if (method in item) {
                results.push(item[method].apply(item, args));
            }
        });
        return results;
    }
};
