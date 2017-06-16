/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.handle = function(object, type, method) {
        if(method) {
            object.addEventListener (type, function() {
                if(!object.getAttribute('disabled')) {
                    me.ui.element.set(object, method, type);
                }
            });
        }
    };
    me.click = {
        set : function(object, value) {
            me.handle(object, "click", value);
        }
    };
    me.dblclick = {
        set : function(object, value) {
            me.handle(object, "dblclick", value);
        }
    };
};
