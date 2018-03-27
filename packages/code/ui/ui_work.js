/*
 @author Zakai Hamilton
 @component UIWork
 */

screens.ui.work = function UIWork(me) {
    me.state = {
        get: function(object) {
            return object.inWork;
        },
        set: function(object, state) {
            if(typeof object.inWork === "undefined") {
                object.inWork = 0;
            }
            if(state) {
                object.inWork++;
                if(object.inWork === 1) {
                    me.core.property.set(object, "work", true);
                }
            }
            else {
                object.inWork--;
                if(object.inWork === 0) {
                    me.core.property.set(object, "work", false);
                }
            }
        }
    };
};