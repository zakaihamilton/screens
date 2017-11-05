/*
 @author Zakai Hamilton
 @component CanvasDirty
 */

package.canvas.dirty = function CanvasDirty(me) {
    me.attach = function (object) {
        object.setDirty = function () {
            me.setDirty(this);
        };
    };
    me.setDirty = function (object) {
        while (object) {
            if (object.isDirty) {
                break;
            }
            if ("setDirty" in object) {
                object.isDirty = true;
            } else {
                me.package.core.property.set(object, "setDirty");
                break;
            }
            object = object.parentNode;
        }
    };
    me.draw = function (object, canvas) {
        if (object !== canvas) {
            me.package.canvas.background.draw(object, canvas);
            me.package.canvas.border.draw(object, canvas);
            me.package.canvas.text.draw(object, canvas);
        }
        var childList = me.package.ui.node.childList(object);
        for (var index = 0; index < childList.length; index++) {
            var child = childList[index];
            me.draw(child, canvas);
        }
    };
};
