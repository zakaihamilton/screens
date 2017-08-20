/*
 @author Zakai Hamilton
 @component UIWork
 */

package.ui.work = function UIWork(me) {
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
                    me.set(object, "work", true);
                }
            }
            else {
                object.inWork--;
                if(object.inWork === 0) {
                    me.set(object, "work", false);
                }
            }
        }
    };
};