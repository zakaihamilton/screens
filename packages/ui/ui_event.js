/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = new function UIEvent() {
    var me = this;
    me.set_pressed = function(object, value) {
        console.log("object: " + object + " value: " + value);
        if(value) {
            object.addEventListener ("click", function() {
                console.log("value: " + value + " object: " + object);
                package.core.message.send({path:value,params:[object]});
            });
        }
    };
};
