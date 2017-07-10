/*
 @author Zakai Hamilton
 @component WidgetEmbed
 */

package.widget.desktop = function WidgetDesktop(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.theme.class": "background",
        "ui.touch.dblclick": "tasks"
    };
    me.tasks = {
        set: function (object, value) {
            package.include("app.tasks", function (failure) {
                if (!failure) {
                    me.send("app.tasks.launch");
                }
            });
        }
    };
};
