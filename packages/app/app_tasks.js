/*
 @author Zakai Hamilton
 @component AppTasks
 */

package.app.tasks = function AppTasks(me) {
    me.launch = function () {
        if (me.the.core.property.get(me.singleton, "ui.node.parent")) {
            me.the.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.the.ui.element.create(__json__, "workspace", "self");
    };
    me.tasks = {
        get: function(object) {
            var isFirst = true;
            var windows = me.the.ui.node.members(me.the.ui.element.workspace(), me.the.widget.window.id);
            var items = windows.reverse().map(function(window) {
                var label = me.the.core.property.get(window, "label");
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
        var windows = me.the.ui.node.members(me.the.ui.element.workspace(), me.the.widget.window.id);
        var tasks = me.the.core.property.get(me.singleton.var.tasks, "selection");
        if(tasks.length) {
            var task = tasks[0];
            windows.map(function(window) {
                var label = me.the.core.property.get(window, "label");
                if(label === task) {
                    selectedTask = window;
                }
            });
        }
        return selectedTask;
    };
    me.switchTo = {
        set: function(object, value) {
            me.the.core.property.set(me.singleton, "widget.window.close");
            var task = me.findSelectedTask();
            me.the.core.property.set(task, "widget.window.show", true);
        }
    };
    me.closeTask = {
        set: function(object, value) {
            var task = me.findSelectedTask();
            me.the.core.property.set(task, "widget.window.close");
            me.the.core.property.set(me.singleton, "widget.window.close");
            me.singleton = me.the.ui.element.create(__json__, "workspace", "self");
        }
    };
    me.tile = {
        set: function(object, value) {
            me.the.core.property.set(me.singleton, "widget.window.close");
            var body = me.the.core.property.get(object, "ui.element.body");
            me.the.core.property.set(body, "ui.arrange.tileHorizontally");
        }
    };
    me.cascade = {
        set: function(object, value) {
            me.the.core.property.set(me.singleton, "widget.window.close");
            var body = me.the.core.property.get(object, "ui.element.body");
            me.the.core.property.set(body, "ui.arrange.cascade");
        }
    };
};
