/*
 @author Zakai Hamilton
 @component WidgetClock
 */

screens.widget.clock = function WidgetClock(me, { core }) {
    me.element = {
        properties: {
            "ui.class.class": "container"
        },
        create: function (object) {
            setInterval(function () {
                var today = new Date();
                var h = today.getHours();
                var m = today.getMinutes();
                if (m < 10) {
                    m = "0" + m;
                }
                core.property.set(object, "ui.basic.text", h + ":" + m);
            }, 1000);
        }
    };
};
