/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

package.widget.icon = function WidgetIcon(me) {
    me.depends = {
        properties: ["ui.basic.src", "text"]
    };
    me.extend = ["ui.move"];
    me.default = {
        "ui.basic.tag": "div",
        "ui.style.class" : "widget.icon.border"
    };
    me.create = function(object) {
        me.ui.element.create([{
                "ui.basic.src": "",
                "ui.style.position": "relative",
                "ui.style.left": "40px",
                "ui.style.top": "0px",
                "ui.style.pointer-events" : "none",
                "ui.move.element": object.path,
                "ui.basic.var": "icon"
            },
            {
                "ui.basic.text": "",
                "ui.style.position": "relative",
                "ui.style.left": "0px",
                "ui.style.top": "0px",
                "ui.style.width": "100px",
                "ui.style.height": "50px",
                "ui.style.text-align": "center",
                "ui.basic.var": "label"
            }], object);
    };
};
