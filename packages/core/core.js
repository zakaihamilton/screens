/*
    @author Zakai Hamilton
    @component Core
*/

function ready() {
    console.log(core.object.test());
};

var core = new function() {
    //methods
    this.set = function(package, name, property) {
        Object.defineProperty(package, name, {
            get: property,
            set: undefined
        });
    };
    this.register = function(package, name, component) {
        this.set(package, name, function() {
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
            global.core = core;
            path="../" + package + "/" + package + "_" + name;
            require(path);
            callback();
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
            core.import(url[0], url[1], function() {
                responses_left--;
                if(responses_left <= 0) { 
                    callback(urls)
                }
            });
        });
    };
    //init
    this.set(this, "platform", function() {
        if(typeof require !== 'undefined') {
            return "server";
        }
        else {
            return "client";
        }
    });
    this.imports([
        ["core", "object"]
    ], function() { ready(); });
};
