/*
 @author Zakai Hamilton
 @component AppTasks
 */

package.app.tasks = function AppTasks(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            me.set(me.singleton, "ui.focus.active", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
    };
    me.tasks = {
        get: function(object) {
            var isFirst = true;
            var tasks = me.ui.node.members(document.body, me.widget.window.id);
            var items = tasks.map(function(window) {
                var title = me.get(window, "title");
                if(title === "Task List") {
                    return null;
                }
                var item = [
                    title,
                    function() {
                        me.set(window, "widget.window.show", true);
                        me.set(window, "ui.focus.active", true);
                    },
                    {
                        "seperator":isFirst
                    }
                ];
                isFirst = false;
                return item;
            });
            return items;
        }
    };
};
