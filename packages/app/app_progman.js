/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            me.set(me.singleton, "ui.focus.active", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
    };
    me.options = {
        "auto_arrange": false,
        "minimize_on_use": true,
        "save_on_exit": true
    };
    me.auto_arrange = me.ui.property.toggleOptionSet(me, "auto_arrange");
    me.minimize_on_use = me.ui.property.toggleOptionSet(me, "minimize_on_use");
    me.save_on_exit = me.ui.property.toggleOptionSet(me, "save_on_exit");
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function (object, value) {
            var args = me.core.cmd.splitArguments(object.args);
            if (args) {
                package.include("app." + args[0], function (failure) {
                    if (failure) {
                        //todo raise error dialog
                    } else {
                        me.send("app." + args[0] + ".launch", args.slice(1));
                    }
                    if (me.options["minimize_on_use"]) {
                        me.set(me.singleton, "minimize", null);
                    }
                });
            }
        }
    };
    me.windows = {
        get: function(object) {
            var isFirst = true;
            var windows = me.get(me.singleton, "widget.window.windows");
            windows.sort(function(a, b){
              var a_title = me.get(a, "title");
              var b_title = me.get(b, "title");
              return a_title === b_title ? 0 : +(a_title > b_title) || -1;
            });
            var items = windows.map(function(window) {
                var result = [
                    me.get(window, "title"),
                    function() {
                        me.set(window, "widget.window.show", true);
                        me.set(window, "ui.focus.active", true);
                    },
                    {
                        "separator":isFirst
                    }
                ];
                isFirst = false;
                return result;
            });
            return items;
        }
    };
};
