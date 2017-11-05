/*
 @author Zakai Hamilton
 @component AppControls
 */

package.app.controls = function AppControls(me) {
    me.launch = function () {
        if(me.package.core.property.get(me.singleton, "ui.node.parent")) {
            me.package.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.package.ui.element.create(__json__);
    };
};
