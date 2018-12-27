/*
    @author Zakai Hamilton
    @component CoreJson
*/

screens.core.json = function CoreJson(me) {
    me.init = function () {
        me.files = {};
    };
    me.loadComponent = async function (path, useCache = true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".json";
        var json = await me.loadFile(url, useCache);
        return json;
    };
    me.loadFile = async function (path, useCache = true) {
        if (useCache && path in me.files) {
            return me.files[path];
        }
        else {
            if (path && path.startsWith("/")) {
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
            catch (err) {
                var error = "Cannot load json file: " + path + " err: " + err.message || err;
                me.log_error(error);
            }
            if (json) {
                json = JSON.parse(json);
            }
            if (useCache) {
                me.files[path] = json;
            }
            return json;
        }
    };
    me.compare = function (source, target) {
        if (typeof source !== typeof target) {
            return false;
        }
        if (source === target) {
            return true;
        }
        if (!source && !target) {
            return true;
        }
        if (!source || !target) {
            return false;
        }
        else if (Array.isArray(source)) {
            var equal = true;
            target.map((item, index) => {
                var sourceItem = source[index];
                if (!me.compare(sourceItem, item)) {
                    equal = false;
                }
            });
            return equal;
        }
        else if (typeof source === "object") {
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
        }
        else {
            return false;
        }
    };
    me.traverse = function (root, path, value) {
        var item = root, parent = root, found = false, name = null;
        if (root) {
            item = path.split(".").reduce((node, token) => {
                parent = node;
                name = token;
                if (!node) {
                    return;
                }
                return node[token];
            }, root);
            if (typeof item !== "undefined") {
                value = item;
                found = true;
            }
        }
        return { parent, item, value, name, found };
    };
    me.value = function (root, paths, value) {
        var found = false;
        Object.entries(paths).forEach(([path, callback]) => {
            if (found) {
                return;
            }
            var info = me.traverse(root, path, value);
            if (info.found) {
                if (callback) {
                    var result = callback(value, path);
                    if (result) {
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
    me.union = function (array, property) {
        return array.filter((obj, pos, arr) => {
            return arr.map(mapObj => mapObj[property]).indexOf(obj[property]) === pos;
        });
    };
    me.intersection = function (arrays, property) {
        var results = [];
        results.push(...arrays[0]);
        for (var array of arrays) {
            var keys = array.map(mapObj => mapObj[property]);
            results = results.filter(mapObj => -1 !== keys.indexOf(mapObj[property]));
        }
        return results;
    };
};
