/*
 @author Zakai Hamilton
 @component AppTerminal
 */

screens.app.terminal = function AppTerminal(me, packages) {
    const { core, ui } = packages;
    me.launch = function () {
        me.singleton = ui.element.create(me.json);
        return me.singleton;
    };
    me.response = {
        set: function (object, value) {
            core.cmd.handle(object, value);
        }
    };
};
