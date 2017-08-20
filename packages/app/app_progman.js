/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.launch = function () {
        if (me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        return me.singleton = me.ui.element.create(__json__);
    };
    me.init = function() {
        me.ui.options.load(me, null, {
            "auto_arrange": false,
            "minimize_on_use": true,
            "save_on_exit": true
        });
        me.auto_arrange = me.ui.options.toggleSet(me, "auto_arrange");
        me.minimize_on_use = me.ui.options.toggleSet(me, "minimize_on_use");
        me.save_on_exit = me.ui.options.toggleSet(me, "save_on_exit");
    };
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function (object, value) {
            var args = me.core.cmd.splitArguments(object.args);
            if (args) {
                package.include("app." + args[0], function (info) {
                    if (info.complete) {
                        me.send("app." + args[0] + ".launch", args.slice(1));
                    }
                    if (me.options["minimize_on_use"]) {
                        me.set(me.singleton, "minimize");
                    }
                });
            }
        }
    };
};
