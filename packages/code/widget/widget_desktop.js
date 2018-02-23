/*
 @author Zakai Hamilton
 @component WidgetDesktop
 */

package.widget.desktop = function WidgetDesktop(me) {
    me["ui.element.default"] = {
        "ui.basic.tag": "div",
        "ui.class.class": "container",
        "ui.basic.elements":[
            {
                "ui.basic.tag":"div",
                "ui.class.class":"background"
            },
            {
                "ui.element.component":"widget.bar",
                "ui.basic.var":"bar"
            },
            {
                "ui.element.tag":"div",
                "ui.basic.var":"workspace",
                "ui.class.class":"workspace",
                "ui.basic.elements":[
                    {
                        "ui.basic.tag": "div",
                        "ui.class.class": "background",
                        "ui.touch.dblclick": "core.app.tasks"
                    }
                ]
            }
        ]
    };
};
