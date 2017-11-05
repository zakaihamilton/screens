/*
 @author Zakai Hamilton
 @component AppControls
 */

package.app.controls = function AppControls(me) {
    me.launch = function () {
        if(me.the.core.property.get(me.singleton, "ui.node.parent")) {
            me.the.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.the.ui.element.create(__json__);
    };
};
