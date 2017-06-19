/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.handle = function(object, type, method) {
        if(method) {
            if(!object.event_types) {
                object.event_types = [];
            }
            object.event_types.push(type);
            object.addEventListener (type, function(event) {
                /* Because of double click that can interfere with single click
                 * if both double click and single click are on the same object
                 * then delay the single click for the double click to occur before
                 * the single click is sent
                 */
                var callback = function() {
                };
                if(type === "click" && object.event_types.indexOf("dblclick") !== -1) {
                    object.event_dblclick = false;
                    setTimeout(function() {
                        if(object.event_dblclick) {
                            return;
                        }
                        if(!object.getAttribute('disabled')) {
                            me.ui.element.set(object, method, event);
                        }
                    }, 200);
                }
                else {
                    if(type === "dblclick") {
                        object.event_dblclick = true;
                    }
                    if(!object.getAttribute('disabled')) {
                        me.ui.element.set(object, method, event);
                    }
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
