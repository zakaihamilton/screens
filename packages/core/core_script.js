/*
 @author Zakai Hamilton
 @component CoreScript
 */

package.core.script = function CoreScript(me) {
    var core = me.core;
    core.event.link("core.module", "core.script", true);
    me.parse = function(info) {
        var data = info.body;
        /* Apply variables */
        if(info.vars && data) {
            for(var key in info.vars) {
                if(info.vars.hasOwnProperty(key)) {
                    data = data.split("__" + key + "__").join(info.vars[key]);
                }
            }
        }
        info.body = data;
    };
};
