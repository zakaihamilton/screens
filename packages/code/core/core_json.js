/*
    @author Zakai Hamilton
    @component CoreJson
*/

screens.core.json = function CoreJson(me, { core, storage }) {
    me.init = function () {
        if (me.platform === "server") {
            me.request = require("request");
        }
    };
    me.loadComponent = async function (path, useCache = true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".json";
        var json = await me.loadFile(url, useCache);
        return json;
    };
    me.get = async function (url) {
        if (me.platform === "server") {
            return new Promise(resolve => {
                me.log("requesting: " + url);
                me.request.get(url, (error, response, body) => {
                    if (error) {
                        resolve({ error });
                    }
                    else {
                        if (body[0] === "<") {
                            resolve({ error: "response is in an xml format" });
                            return;
                        }
                        let json = JSON.parse(body);
                        resolve(json);
                    }
                });
            });
        }
        else {
            return core.message.send_server("core.json.get", url);
        }
    };
    me.loadFile = async function (path) {
        let json = {};
        if (path && path.startsWith("/")) {
            path = path.substring(1);
        }
        if (!core.util.isOnline()) {
            json = await storage.local.db.get(me.id, path);
            if (json) {
                return json;
            }
        }
        var info = {
            method: "GET",
            url: "/" + path
        };
        let buffer = "{}";
        try {
            buffer = await core.http.send(info);
        }
        catch (err) {
            var error = "Cannot load json file: " + path + " err: " + err.message || err;
            me.log_error(error);
        }
        if (buffer) {
            json = JSON.parse(buffer);
        }
        await storage.local.db.set(me.id, path, json);
        return json;
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
            var equal = source.length === target.length;
            if (equal) {
                target.map((item, index) => {
                    var sourceItem = source[index];
                    if (!me.compare(sourceItem, item)) {
                        equal = false;
                    }
                });
            }
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
    me.processVars = function (object, text, root) {
        text = text.replace(/\${[^{}]*}/g, function (match) {
            var path = match.substring(2, match.length - 1);
            if (path.startsWith("@")) {
                path = path.substring(1);
                if (path === "date") {
                    return new Date().toString();
                }
                else {
                    var info = core.property.split(object, path);
                    let item = me.traverse(root, info.value);
                    if (item.found) {
                        return core.property.get(object, info.name, item.value);
                    }
                    return "";
                }
            }
            let item = me.traverse(root, path);
            if (item.found) {
                var value = item.value;
                if (typeof value === "object") {
                    value = JSON.stringify(value);
                }
                return value;
            }
            return "";
        });
        return text;
    };
    me.map = function (root, before, after) {
        if (before) {
            root = before(root);
        }
        if (Array.isArray(root)) {
            root = Array.from(root);
        }
        else if (root instanceof ArrayBuffer) {
            root = root.slice(0);
        }
        else if (root !== null && typeof root === "object") {
            root = Object.assign({}, root);
        }
        if (typeof root !== "string") {
            for (var key in root) {
                root[key] = me.map(root[key], before, after);
            }
        }
        if (after) {
            root = after(root);
        }
        return root;
    };
    me.isValid = function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    };
};
