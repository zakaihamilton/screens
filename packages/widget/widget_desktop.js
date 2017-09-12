/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

package.widget.desktop = function WidgetDesktop(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.class.class": "background",
        "ui.touch.dblclick": "core.app.tasks"
    };
    me.create = {
        set: function (object) {
            if (window.addEventListener) {
                window.addEventListener('DOMMouseScroll', me.preventDefault, false);
            }
            window.onwheel = me.preventDefault;
            window.ontouchmove = me.preventDefault;
            window.onmousewheel = document.onmousewheel = me.preventDefault;
        }
    };
    me.preventDefault = function (event) {
        event = event || window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        if(event.stopPropagation) {
            event.stopPropagation();
        }
        event.returnValue = false;
    };
};
