/*
    @author Zakai Hamilton
    @component CoreJson
*/

screens.core.json = function CoreJson(me) {
    me.init = function() {
        me.files = {};
    };
    me.loadComponent = async function(path, useCache=true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".json";
        var json = await me.loadFile(url, useCache);
        return json;
    };
    me.loadFile = async function(path, useCache=true) {
        if(useCache && path in me.files) {
            return me.files[path];
        }
        else {
            if(path && path.startsWith("/")) {
                path = path.substring(1);
            }
            var info = {
                method: "GET",
                url: "/" + path
            };
            var json = "{}";
            try {
                json = await me.core.http.send(info);
            }
            catch(err) {
                err = "Cannot load json file: " + path + " err: " + err.message || err;
                me.error(err);
            }
            if(json) {
                json = JSON.parse(json);
            }
            if(useCache) {
                me.files[path] = json;
            }
            return json;
        }
    };
    me.compare = function(source, target) {
        if(source === target) {
            return true;
        }
        if(!source && !target) {
            return true;
        }
        if(!source || !target) {
            return false;
        }
        var sourceKeys = Object.getOwnPropertyNames(source);
        var targetKeys = Object.getOwnPropertyNames(target);
        if (sourceKeys.length !== targetKeys.length) {
            return false;
        }
        for (var i = 0; i < sourceKeys.length; i++) {
            var propName = sourceKeys[i];
            if (source[propName] !== target[propName]) {
                return false;
            }
        }
        return true;
    };
    me.traverse = function(root, path, value) {
        var item = root, parent = root, found = false;
        if(root) {
            var tokens = path.split(".");
            for(var tokensIndex = 0; tokensIndex < tokens.length; tokensIndex++) {
                parent = item;
                var token = tokens[tokensIndex];
                item = item[token];
                if(!item) {
                    break;
                }
            }
            if(item && tokens.length) {
                value = item;
                found = true;
            }
        }
        return {parent, item, value, found};
    };
    me.value = function(root, paths, value) {
        var found = false;
        Object.entries(paths).forEach(([path, callback]) => {
            if(found) {
                return;
            }
            var info = me.traverse(root, path, value);
            if(info.found) {
                if(callback) {
                    var result = callback(value, path);
                    if(result) {
                        info.value = result;
                        found = true;
                    }
                }
                else {
                    value = info.value;
                    found = true;
                }
            }
        });
        return value;
    };
};
