/*
 @author Zakai Hamilton
 @component AppVersion
 */

package.app.version = function AppVersion(me) {
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.package.ui.element.create(__json__, "workspace", "self");
    };
    me.version = {
        get: function(object, info) {
            me.package.lock(info.task, task => {
                me.package.core.json.loadFile(function(json) {
                    info.value = json.version;
                    me.package.unlock(task);
                }, "/package.json");
            });
        }
    };
};
