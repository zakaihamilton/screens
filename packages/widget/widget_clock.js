/*
 @author Zakai Hamilton
 @component WidgetClock
 */

package.widget.clock = function WidgetClock(me) {
    me.default = {
        "ui.theme.class": "container"
    };
    me.create = {
        set: function (object) {
            setInterval(function () {
                var today = new Date();
                var h = today.getHours();
                var m = today.getMinutes();
                if (m < 10) {
                    m = "0" + m;
                }
                ;
                me.set(object, "ui.basic.text", h + ":" + m);
            }, 1000);
        }
    };
};
