/*
 @author Zakai Hamilton
 @component WidgetClock
 */

package.widget.clock = function WidgetClock(me) {
    me.properties = {
        "ui.class.class": "container"
    };
    me.create = function (object) {
        setInterval(function () {
            var today = new Date();
            var h = today.getHours();
            var m = today.getMinutes();
            if (m < 10) {
                m = "0" + m;
            }
            me.core.property.set(object, "ui.basic.text", h + ":" + m);
        }, 1000);
    };
};
