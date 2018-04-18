/*
 @author Zakai Hamilton
 @component AppProgman
 */

screens.app.progman = function AppProgman(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return me.singleton;
        }
        me.singleton = me.ui.element(__json__);
        return me.singleton;
    };
    me.init = function() {
        me.ui.options.load(me, null, {
            "auto_arrange": false,
            "minimize_on_use": true,
            "save_on_exit": true
        });
        me.ui.options.toggleSet(me, null, "auto_arrange");
        me.ui.options.toggleSet(me, null, "minimize_on_use");
        me.ui.options.toggleSet(me, null, "save_on_exit");
    };
    me.args = {
        set: function (object, value) {
            object.args = value;
        }
    };
    me.shell = {
        set: function (object, value) {
            var args = me.core.cmd.split(object.args);
            if (args) {
                if (me.options["minimize_on_use"]) {
                    me.core.property.set(me.singleton, "minimize");
                }
                me.core.app(args[0], args.slice(1));
            }
        }
    };
};
