/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.pressed = {
        set : function(object, value) {
            if(value) {
                object.addEventListener ("click", function() {
                    if(!object.getAttribute('disabled')) {
                        console.log("value: " + value + " object: " + object);
                        me.send(value,object);
                    }
                });
            }
        }
    };
};
