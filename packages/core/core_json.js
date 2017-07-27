/*
    @author Zakai Hamilton
    @component CoreJson
*/

package.core.json = function CoreJson(me) {
    me.init = function() {
        me.files = {};
    };
    me.load = function(callback, path, useCache=true) {
        var period = path.lastIndexOf(".");
        var component_name = path.substring(period + 1);
        var package_name = path.substring(0, period);
        var url = "/packages/" + package_name + "/" + package_name + "_" + component_name + ".json";
        if(useCache && url in me.files) {
            callback(me.files[url]);
        }
        else {
            var parse = function(info) {
                var json = JSON.parse(info.response);
                if(useCache) {
                    me.files[url] = json;
                }
                if(callback) {
                    callback(json);
                }
            };
            var info = {
                method:"get",
                url:url,
                callback:parse,
                mimeType:"application/json"
            };
            me.core.http.send(info);
        }
    };
};
