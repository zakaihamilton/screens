/*
    @author Zakai Hamilton
    @component Core
*/

function ready() {
    console.log(package.core.node.test());
};

var package = {};

var core = new function() {
    //methods
    this.set = function(package_name, component_name, property) {
        if(package[package_name] === 'undefined') {
            package[package_name] = {};
        }
        package_object = package[package_name];
        Object.defineProperty(package_object, component_name, {
            get: property,
            set: undefined
        });
    };
    this.register = function(package_name, component_name, component) {
        this.set(package_name, component_name, function() {
            return new component();
        });
    };
    this.switch = function(exp, cases) {
        if(cases[exp] === undefined) {
            return cases["default"];
        }
        else {
            return cases[exp];
        }
    };
    this.import = function(package, name, callback) {
        this.switch(this.platform, {
        "server": function() {
            path="../" + package + "/" + package + "_" + name;
            require(path);
            setImmediate(callback);
        },
        "client": function() {
            var head = document.getElementsByTagName('head')[0];
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = "packages/" + package + "/" + package + "_" + name + ".js";
            script.onload=callback;
            head.appendChild(script);
            head.appendChild(script);
        }})();
    };
    this.imports = function(urls, callback) {
        responses_left = urls.length;
        core = this;
        urls.map(function(url) {
            name = url[0] + "_" + url[1];
            package.core.import(url[0], url[1], function() {
                responses_left--;
                if(responses_left <= 0) { 
                    callback(urls)
                }
            });
        });
    };
    //init
    package["core"] = this;
    this.set("core", "platform", function() {
        if(typeof require !== 'undefined') {
            return "server";
        }
        else {
            return "client";
        }
    });
    this.switch(this.platform, {
    "server": function() {
        global.package = package;
    },
    "default":function() {
    }})();
    this.imports([
        ["core", "object"],
        ["core", "node"]
    ], function() { ready(); });
};
