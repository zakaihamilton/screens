/*
 @author Zakai Hamilton
 @component CoreScript
 */

package.require("core.script", "server");

package.core.script = function CoreScript(me) {
    var core = me.core;
    me.init = function() {
        me.core.property.link("core.http.parse", "core.script.parse", true);
    };
    me.parse = {
        set: function (info) {
            var data = info.body;
            /* Apply variables */
            if (info.vars && data) {
                for (var key in info.vars) {
                    if (info.vars.hasOwnProperty(key)) {
                        data = data.split("__" + key + "__").join(info.vars[key]);
                    }
                }
            }
            info.body = data;
        }
    };
};
