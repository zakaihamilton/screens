/*
 @author Zakai Hamilton
 @component AppChat
 */

screens.app.chat = function AppChat(me) {
    me.launch = function () {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element(__json__, "workspace", "self");
        return me.singleton;
    };
};
