/*
 @author Zakai Hamilton
 @component UIEvent
 */

package.ui.event = new function() {
    this.set_pressed = function(object, value) {
        console.log("object: " + object + " value: " + value);
        if(value) {
            object.addEventListener ("click", function() {
                console.log("value: " + value + " object: " + object);
                package.core.message.execute({path:value,params:[object]});
            });
        }
    };
};
