/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

package.widget.icon = function WidgetIcon(me) {
    me.depends = {
        properties: ["ui.basic.src", "text"]
    };
    me.redirect = {
        "ui.basic.text" : "widget.icon.text",
        "ui.basic.src" : "widget.icon.src"
    };
    me.extend = ["ui.drag"];
    me.default = {
        "ui.basic.tag": "figure",
        "ui.theme.class": "widget.icon.border",
        "ui.style.text-align": "center",
        "ui.basic.elements": [{
                "ui.basic.src": "",
                "ui.style.pointer-events": "none",
                "ui.drag.element": null,
                "ui.basic.var": "icon"
            },
            {
                "ui.basic.tag": "figcaption",
                "ui.style.display": "block",
                "ui.style.text-align": "center",
                "ui.basic.var": "label"
            }]
    }
    me.text = {
        get: function (object) {
            return object.var.label.innerHTML;
        },
        set: function(object, value) {
            object.var.label.innerHTML = value;
        }
    };
    me.src = {
        get: function (object) {
            return object.var.icon.src;
        },
        set: function (object, value) {
            object.var.icon.src = value;
        }
    };
};
