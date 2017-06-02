/*
 @author Zakai Hamilton
 @component CoreScript
 */

package.core.script = new function() {
    var core = package.core;
    core.event.forward(core.module.id, "core.script", true);
    this.parse = function(info) {
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
