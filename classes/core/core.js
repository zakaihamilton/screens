
function component_register(classes) {
    component = Object.assign(component, classes);
    for (let name in classes) {
        const the_class = classes[name];
        if (the_class.init) {
            the_class.init(name);
        }
    }
}

function component_import(paths, root) {
    for (let path of paths) {
        if (!path.includes(".")) {
            path = root + path;
        }
        if (global.platform === "server") {
            require(path);
        }
    }
}

var component = {
    register: component_register,
    import: component_import,
    platform: typeof module !== "undefined" && this.module !== module ? "server" : "browser"
};

if (component.platform === "server") {
    global.component = component;
}

component.import([
    "core_object",
    "core_file"
], "./");