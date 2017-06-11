/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = function UIEvent(me) {
    me.set_pressed = function(object, value) {
        console.log("object: " + object + " value: " + value);
        if(value) {
            object.addEventListener ("click", function() {
                console.log("value: " + value + " object: " + object);
                me.core.message.send({path:value,params:[object]});
            });
        }
    };
};
