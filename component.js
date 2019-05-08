
var COMPONENT = {
    define: function (id, mapping) {
        let object = mapping;
        if (mapping.constructor) {
            object = mapping.constructor;
            for (let property in mapping) {
                if (property === "constructor") {
                    continue;
                }
                object[property] = mapping[property];
            }
        }
        COMPONENT[id] = object;
        COMPONENT[id].id = id;
    },
    import: function (paths, root) {
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
    start: async function () {
        for (let name in COMPONENT) {
            let comp = COMPONENT[name];
            if (comp.hasOwnProperty("init")) {
                await comp.init(comp);
            }
        }
        for (let name in COMPONENT) {
            let comp = COMPONENT[name];
            if (comp.hasOwnProperty("start")) {
                await comp.start(comp);
            }
        }
    }
};

if (COMPONENT.platform === "server") {
    global.COMPONENT = COMPONENT;
}
