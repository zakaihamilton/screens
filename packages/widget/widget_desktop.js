/*
 @author Zakai Hamilton
 @component WidgetDesktop
 */

package.widget.desktop = function WidgetDesktop(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.class.class": "background",
        "ui.basic.elements":[
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
            },
            {
                "ui.element.component":"widget.bar",
                "ui.basic.var":"bar"
            }
        ]
    };
};
