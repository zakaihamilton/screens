/*
 @author Zakai Hamilton
 @component AppTasks
 */

screens.app.tasks = function AppTasks(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__, "workspace", "self");
    };
    me.tasks = {
        get: function(object) {
            var isFirst = true;
            var windows = me.ui.node.members(me.ui.element.workspace(), me.widget.window.id);
            var items = windows.reverse().map(function(window) {
                var label = me.core.property.get(window, "label");
                if(label === "Task List" || label === "Launcher") {
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
    me.findSelectedTask = function(object) {
        var selectedTask = null;
        var window = me.widget.window.get(object);
        var windows = me.ui.node.members(me.ui.element.workspace(), me.widget.window.id);
        var tasks = me.core.property.get(window.var.tasks, "selection");
        if(tasks.length) {
            var task = tasks[0];
            windows.map(function(window) {
                var label = me.core.property.get(window, "label");
                if(label === task) {
                    selectedTask = window;
                }
            });
        }
        return selectedTask;
    };
    me.switchTo = {
        set: function(object, value) {
            me.core.property.set(me.singleton, "widget.window.close");
            var task = me.findSelectedTask(me.singleton);
            me.core.property.set(task, "widget.window.show", true);
        }
    };
    me.closeTask = {
        get: function(object) {
            var task = me.findSelectedTask(object);
            return task != null;            
        },
        set: function(object, value) {
            var task = me.findSelectedTask(me.singleton);
            me.core.property.set(task, "widget.window.close");
            me.core.property.set(me.singleton, "widget.window.close");
            me.singleton = me.ui.element.create(__json__, "workspace", "self");
        }
    };
    me.tile = {
        set: function(object, value) {
            me.core.property.set(me.singleton, "widget.window.close");
            var workspace = me.ui.element.workspace();
            me.core.property.set(workspace, "ui.arrange.tileHorizontally");
        }
    };
    me.cascade = {
        set: function(object, value) {
            me.core.property.set(me.singleton, "widget.window.close");
            var workspace = me.ui.element.workspace();
            me.core.property.set(workspace, "ui.arrange.cascade");
        }
    };
};
