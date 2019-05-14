
var COMPONENT = {
    define(id, mapping) {
        let object = mapping;
        if (id === "CoreObject") {
            object = mapping.constructor;
        }
        else {
            const hasConstructor = mapping.hasOwnProperty("constructor");
            const hasExtension = mapping.hasOwnProperty("extends");
            let extension = hasExtension ? mapping.extends : "CoreObject";
            object = new Function("path", "COMPONENT." + extension + ".call(this, path);" + (hasConstructor ? "COMPONENT." + id + ".call(this, path)" : ""));
            object.prototype = Object.create(COMPONENT[extension].prototype);
            object.prototype.constructor = object;
            Object.defineProperty(object, "name", { value: id });
        }
        for (let property in mapping) {
            if (property === "constructor") {
                continue;
            }
            object[property] = mapping[property];
        }
        object.package = COMPONENT;
        COMPONENT[id] = object;
        if (!COMPONENT[id].config) {
            COMPONENT[id].config = {};
        }
        COMPONENT[id].config.id = id;
    },
    import(paths, root) {
        for (let path of paths) {
            if (global.platform === "server") {
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
            if (!config.id) {
                continue;
            }
            let comp = COMPONENT[name];
            if ((!config.platform || config.platform === COMPONENT.platform) && comp.hasOwnProperty("init")) {
                await comp.init(comp);
            }
        }
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.id) {
                continue;
            }
            let comp = COMPONENT[name];
            if ((!config.platform || config.platform === COMPONENT.platform) && comp.hasOwnProperty("start")) {
                await comp.start(comp);
            }
        }
    },
    new(path) {
        let matches = [];
        for (let name in COMPONENT) {
            let config = COMPONENT.config(name);
            if (!config.id) {
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
                instance = new COMPONENT[match](path);
            }
        }
        return instance;
    }
};

if (COMPONENT.platform === "server") {
    global.COMPONENT = COMPONENT;
}

COMPONENT.define("CoreObject", {
    init() {

    },
    start() {
        const file = COMPONENT.new("dropbox://test.txt");
        console.log("dropbox: " + file.path);
    },
    constructor(path) {
        this._attachments = [];
        this._parent = null;
        this._holdCount = 0;
        this.path = path;
    },
    attach(component) {
        let instance = this.cast(component);
        if (instance) {
            return instance;
        }
        const parent = this._parent || this;
        instance = new component(parent.path);
        parent._attachments.push(instance);
        instance._parent = parent;
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
        if (this.constructor.name === component.name) {
            return this;
        }
        const parent = this._parent || this;
        const instance = parent._attachments.find(item => item.constructor.name === component.name);
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
    }
});