/* A component is defined with the following properties

COMPONENT.define({
    name: "PackageComponent", // Component name
    config: {  // an optional configuration
        protocol: /^prefix:\/\// for path matching for new instances
        platform: "server" // for platform specific components
    },
    init () {
    
    },
    start() {
    
    },
    constructor() {
    
    },
    method() {
    
    },
});

*/

var COMPONENT = {
    forward: {},
    define(mapping) {
        let name = mapping.name;
        let proxy = false;
        let component = null;
        if (mapping.config && mapping.config.platform && mapping.config.platform !== COMPONENT.platform) {
            let platform = mapping.config.platform;
            let handler = {
                get: function (object, property) {
                    if (property in object) {
                        return Reflect.get(object, property);
                    }
                    else {
                        return new Proxy(() => {
                            let path = object();
                            return path + "." + property;
                        }, handler);
                    }
                },
                apply: function (target, thisArg, argumentList) {
                    var args = Array.prototype.slice.call(argumentList);
                    args.unshift(target());
                    return COMPONENT.forward[platform].apply(thisArg, args);
                }
            };
            let object = new Proxy(() => { return name; }, handler);
            object.id = name;
            proxy = true;
        }
        else if (name === "CoreObject") {
            component = class {
                constructor(parent) {
                    this.id = name;
                    this.package = COMPONENT;
                    mapping.constructor.call(this, parent);
                }
            };
        }
        else {
            let extension = mapping.config && mapping.config.extends ? mapping.config.extends : "CoreObject";
            let parent = COMPONENT[extension];
            component = class extends parent {
                constructor(parent) {
                    super(parent);
                    this.id = name;
                    if (mapping.hasOwnProperty("constructor")) {
                        mapping.constructor.call(this, parent);
                    }
                    if (this.config) {
                        let attachments = this.config.attach;
                        if (attachments) {
                            for (let name in attachments) {
                                let attachment = attachments[name];
                                if (typeof attachment === "string") {
                                    attachment = COMPONENT[attachment];
                                }
                                this[name] = this.attach(attachment);
                            }
                        }
                    }
                }
            };
        }
        Object.defineProperty(component, "name", { value: name });
        Object.defineProperty(component.prototype, "name", { value: name });
        component._mapping = mapping;
        if (!component.prototype) {
            component.prototype = {};
        }
        if (!proxy) {
            for (let property in mapping) {
                if (property === "name") {
                    continue;
                }
                component.prototype[property] = mapping[property];
                component[property] = mapping[property];
            }
        }
        COMPONENT[name] = component;
        component.package = COMPONENT;
        if (!component.config) {
            component.config = {};
        }
        component.config.name = name;
    },
    async import(paths, root) {
        if (COMPONENT.platform === "server") {
            for (let path of paths) {
                const fs = require("fs");
                let dir = process.cwd();
                path = require("path").resolve(dir, root + path);
                var names = fs.readdirSync(path);
                for (let name of names) {
                    if (name.endsWith(".js")) {
                        require(path + "/" + name);
                    }
                }
            }
        } else if (COMPONENT.platform === "browser") {
            for (let path of paths) {
                await new Promise((resolve, reject) => {
                    let parentNode = document.getElementsByTagName("head")[0];
                    var item = document.createElement("script");
                    item.src = root + path;
                    item.async = true;
                    item.onload = () => {
                        resolve(item);
                    };
                    item.onerror = () => {
                        console.log("Failure in loading file: " + root + path);
                        reject();
                    };
                    parentNode.appendChild(item);
                });
            }
        }
    },
    platform: typeof module !== "undefined" && this.module !== module ? "server" : "browser",
    config(name) {
        let config = {};
        let comp = COMPONENT[name];
        if (comp.hasOwnProperty("config")) {
            config = comp.config;
        }
        return config;
    },
    async start() {
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.name) {
                continue;
            }
            let comp = COMPONENT[name];
            if ((!config.platform || config.platform === COMPONENT.platform) && comp.hasOwnProperty("init")) {
                await comp.init(comp);
            }
        }
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.extends) {
                continue;
            }
            let comp = COMPONENT[name];
            let parent = COMPONENT[config.extends];
            if ((!config.platform || config.platform === COMPONENT.platform) && parent.hasOwnProperty("extends")) {
                await parent.extends(comp);
            }
        }
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.name) {
                continue;
            }
            let comp = COMPONENT[name];
            if ((!config.platform || config.platform === COMPONENT.platform) && comp.hasOwnProperty("start")) {
                await comp.start(comp);
            }
        }
    },
    instance(path) {
        let matches = [];
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.name) {
                continue;
            }
            if ((!config.platform || config.platform === COMPONENT.platform)) {
                if (config.protocol && config.protocol.test(path)) {
                    matches.push(name);
                }
            }
        }
        let instance = null;
        for (let match of matches) {
            if (instance) {
                instance.attach(COMPONENT[match]);
            }
            else {
                instance = new COMPONENT[match]();
                instance.path = path;
            }
        }
        return instance;
    }
};

if (COMPONENT.platform === "server") {
    global.COMPONENT = COMPONENT;
} else if (COMPONENT.platform === "browser") {
    window.COMPONENT = COMPONENT;
}

COMPONENT.define({
    name: "CoreObject",
    init() {

    },
    constructor(parent) {
        this._attachments = [];
        this._parent = parent;
        if (parent) {
            parent._attachments.push(this);
        }
        this._holdCount = 0;
    },
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
    },
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
    },
    cast(component) {
        if (!component) {
            return null;
        }
        if (this.id === component.id) {
            return this;
        }
        const parent = this._parent || this;
        if (parent.id === component.id) {
            return parent;
        }
        const instance = parent._attachments.find(item => item.id === component.id);
        return instance;
    },
    hold() {
        const parent = this._parent || this;
        parent._holdCount++;
    },
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
    },
    async send(method, params) {
        var args = Array.prototype.slice.call(arguments, 1);
        const parent = this._parent || this;
        let list = [parent, ...parent._attachments];
        list.map(item => {
            if (method in item) {
                item[method].apply(item, args);
            }
        });
    }
});