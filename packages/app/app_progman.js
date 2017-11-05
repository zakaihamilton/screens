/*
 @author Zakai Hamilton
 @component AppProgman
 */

package.app.progman = function AppProgman(me) {
    me.launch = function () {
        if (me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        return me.singleton = me.package.ui.element.create(__json__);
    };
    me.init = function() {
        me.package.ui.options.load(me, null, {
            "auto_arrange": false,
            "minimize_on_use": true,
            "save_on_exit": true
        });
        me.auto_arrange = me.package.ui.options.toggleSet(me, "auto_arrange");
        me.minimize_on_use = me.package.ui.options.toggleSet(me, "minimize_on_use");
        me.save_on_exit = me.package.ui.options.toggleSet(me, "save_on_exit");
    };
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function (object, value) {
            var args = me.package.core.cmd.split(object.args);
            if (args) {
                package.include("app." + args[0], function (info) {
                    if (info.complete) {
                        me.package.core.message.send("app." + args[0] + ".launch", args.slice(1));
                    }
                    if (me.options["minimize_on_use"]) {
                        me.package.core.property.set(me.singleton, "minimize");
                    }
                });
            }
        }
    };
};
