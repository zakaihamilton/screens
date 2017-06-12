/*
 @author Zakai Hamilton
 @component UIPopup
 */

package.ui.popup = function UIPopup(me) {
    me.require = {platform:"browser"};
    me.popup = null;
    me.init = function() {
        window.addEventListener ("click", me.handle_popup);
    };
    me.handle_popup = function(e) {
        if(me.skipFirstClick) {
            me.skipFirstClick = false;
            return;
        }
        if(me.popup && !me.in_popup(e.target, me.popup)) {
            var component = package[me.popup.component];
            component.send("close", me.popup);
            me.popup = null;
        }
    };
    me.close = function(object) {
        me.popup = null;
    };
    me.extend = function (object) {
        me.popup = object;
        me.skipFirstClick = true;
    };
    me.in_popup = function (object, target) {
        while (object) {
            if (object === target) {
                return true;
            }
            object = object.parentNode;
        }
        return false;
    };
};
