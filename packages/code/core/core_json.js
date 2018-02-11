/*
    @author Zakai Hamilton
    @component CoreJson
*/

package.core.json = function CoreJson(me) {
    me.init = function() {
        me.files = {};
    };
    me.loadComponent = function(callback, path, useCache=true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/code/" + package_name + "/" + package_name + "_" + component_name + ".json";
        me.loadFile(callback, url, useCache);
    };
    me.loadFile = function(callback, path, useCache=true) {
        if(useCache && path in me.files) {
            callback(me.files[path]);
        }
        else {
            if(path && path.startsWith("/")) {
                path = path.substring(1);
            }
            me.core.file.readFile(function(err, data) {
                var json = {};
                if(data) {
                    json = JSON.parse(data);
                }
                if(useCache) {
                    me.files[path] = json;
                }
                if(callback) {
                    callback(json);
                }
            }, path, 'utf8');
        }
    };
    me.log = function(json) {
        me.core.console.log(JSON.stringify(json, null, 4));        
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
        var item = root, parent = root;
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
            if(item) {
                value = item;
            }
        }
        return {parent:parent,item:item,value:value};
    };
};
