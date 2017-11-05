/*
 @author Zakai Hamilton
 @component AppCanvas
 */

package.app.canvas = function AppCanvas(me) {
    me.launch = function () {
        if(me.the.core.property.get(me.singleton, "ui.node.parent")) {
            me.the.core.property.set(me.singleton, "widget.window.show", true);
            return;
        }
        me.singleton = me.the.ui.element.create(__json__);
    };
    me.pos = {
        get: function(object) {
            var abs_region = me.the.ui.rect.absolute_region(object);
            var rel_region = me.the.ui.rect.relative_region(object);
            return rel_region.left + "x" + rel_region.top +
                    "(" + abs_region.left + "x" + abs_region.top + ")";
        }
    };
};
