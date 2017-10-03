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
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.tasks = {
        get: function(object) {
            var isFirst = true;
            var windows = me.ui.node.members(me.ui.element.workspace(), me.widget.window.id);
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
    me.findSelectedTask = function() {
        var selectedTask = null;
        var windows = me.ui.node.members(me.ui.element.workspace(), me.widget.window.id);
        var tasks = me.get(me.singleton.var.tasks, "selection");
        if(tasks.length) {
            var task = tasks[0];
            windows.map(function(window) {
                var label = me.get(window, "label");
                if(label === task) {
                    selectedTask = window;
                }
            });
        }
        return selectedTask;
    };
    me.switchTo = {
        set: function(object, value) {
            me.set(me.singleton, "widget.window.close");
            var task = me.findSelectedTask();
            me.set(task, "widget.window.show", true);
        }
    };
    me.closeTask = {
        set: function(object, value) {
            var task = me.findSelectedTask();
            me.set(task, "widget.window.close");
            me.set(me.singleton, "widget.window.close");
            me.singleton = me.ui.element.create(__json__, "workspace", "self");
        }
    };
    me.tile = {
        set: function(object, value) {
            me.set(me.singleton, "widget.window.close");
            var body = me.get(object, "ui.element.body");
            me.set(body, "ui.arrange.tileHorizontally");
        }
    };
    me.cascade = {
        set: function(object, value) {
            me.set(me.singleton, "widget.window.close");
            var body = me.get(object, "ui.element.body");
            me.set(body, "ui.arrange.cascade");
        }
    };
};
