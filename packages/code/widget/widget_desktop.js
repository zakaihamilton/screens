/*
 @author Zakai Hamilton
 @component WidgetDesktop
 */

screens.widget.desktop = function WidgetDesktop(me) {
    me.element = {
        properties : {
            "ui.basic.tag": "div",
            "ui.class.class": "container",
            "ui.basic.elements": [
                {
                    "ui.element.component": "widget.taskbar",
                    "ui.basic.var": "bar"
                },
                {
                    "ui.element.tag": "div",
                    "ui.basic.var": "workspace",
                    "ui.class.class": "workspace",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": "background",
                            "ui.touch.dblclick":"core.app.launcher"
                        }
                    ]
                }
            ]
        }
    };
};
