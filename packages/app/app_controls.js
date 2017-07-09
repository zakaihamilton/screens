/*
 @author Zakai Hamilton
 @component AppControls
 */

package.app.controls = function AppControls(me) {
    me.require = {platform: "browser"};
    me.launch = function () {
        if(me.get(me.singleton, "ui.node.parent")) {
            me.set(me.singleton, "ui.focus.active", true);
            me.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.ui.element.create(__json__);
    };
};
