/*
 @author Zakai Hamilton
 @component WidgetTaskBar
 */

screens.widget.taskbar = function WidgetTaskBar(me) {
    me.element = {
        properties : {
            "ui.class.class": "container",
            "ui.basic.elements": [
                {
                    "ui.basic.tag": "img",
                    "ui.basic.src": "/packages/res/icons/launcher.png",
                    "ui.touch.click": "core.app.launcher",
                    "ui.class.class": "launcher",
                    "ui.basic.var": "launcher"
                }
            ]
        }
    }
};