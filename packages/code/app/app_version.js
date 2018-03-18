/*
 @author Zakai Hamilton
 @component AppVersion
 */

package.app.version = function AppVersion(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        return me.singleton;
    };
    me.version = {
        get: function(object, info) {
            me.lock(info.task, task => {
                me.core.json.loadFile(function(json) {
                    info.value = json.version;
                    me.unlock(task);
                }, "/package.json");
            });
        }
    };
};
