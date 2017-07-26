/*
 @author Zakai Hamilton
 @component AppTasks
 */

package.app.tasks = function AppTasks(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "desktop", "self");
    };
    me.tasks = {
        get: function(object) {
            var isFirst = true;
            var windows = me.ui.node.members(me.ui.element.desktop(), me.widget.window.id);
            var items = windows.reverse().map(function(window) {
                var label = me.get(window, "label");
                if(label === "Task List") {
                    return null;
                }
                var item = [
                    label,
                    isFirst
                ];
                isFirst = false;
                return item;
            });
            return items;
        }
    };
    me.switchTo = {
        set: function(object, value) {
            var windows = me.ui.node.members(me.ui.element.desktop(), me.widget.window.id);
            me.set(me.singleton, "widget.window.close");
            var tasks = me.get(me.singleton.var.tasks, "selection");
            if(tasks.length) {
                var task = tasks[0];
                windows.map(function(window) {
                    var label = me.get(window, "label");
                    if(label === task) {
                        me.set(window, "widget.window.show", true);
                    }
                });
            }
        }
    };
};
