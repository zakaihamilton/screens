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
    components(platform) {
        let components = [];
        for (let name in COMPONENT) {
            let component = COMPONENT[name];
            if (!component.prototype || !component.prototype.constructor) {
                continue;
            }
            if (platform) {
                let config = component.config();
                if (config && config.platform !== platform) {
                    continue;
                }
            }
            Object.defineProperty(component, "name", { value: name });
            components.push(component);
        }
        return components;
    },
    async start() {
        let components = COMPONENT.components(COMPONENT.platform);
        for (let component of components) {
            await component.init.call(component, component);
        }
        for (let component of components) {
            await component.start.call(component, component);
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