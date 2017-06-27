/*
 @author Zakai Hamilton
 @component WidgetIcon
 */

package.widget.icon = function WidgetIcon(me) {
    me.depends = {
        properties: ["ui.basic.src", "text"]
    };
    me.extend = ["ui.drag"];
    me.default = {
        "ui.basic.tag": "figure",
        "ui.basic.context":null,
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
};
