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
        var url = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".json";
        me.loadFile(callback, url, useCache);
    };
    me.loadFile = function(callback, path, useCache=true) {
        if(useCache && path in me.files) {
            callback(me.files[path]);
        }
        else {
            var parse = function(info) {
                var json = {};
                if(info.response) {
                    json = JSON.parse(info.response);
                }
                if(useCache) {
                    me.files[path] = json;
                }
                if(callback) {
                    callback(json);
                }
            };
            var info = {
                method:"get",
                url:path,
                callback:parse,
                mimeType:"application/json"
            };
            me.core.http.send(info);
        }
    };
    me.log = function(json) {
        console.log(JSON.stringify(json, null, 4));        
    };
    me.convert = function(source, target, mapping) {
        
    };
};
