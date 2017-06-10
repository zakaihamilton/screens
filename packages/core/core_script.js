/*
 @author Zakai Hamilton
 @component CoreScript
 */

package.core.script = function CoreScript(me) {
    var core = package.core;
    core.event.forward("core.module", "core.script", true);
    me.parse = function(info) {
        var data = info.body;
        /* Apply variables */
        if(info.vars) {
            for(var key in info.vars) {
                if(info.vars.hasOwnProperty(key)) {
                    data = data.split("@" + key).join(info.vars[key]);
                }
            }
        }
        info.body = data;
    };
};
