/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.container = function WidgetContainer(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.theme.class":"root"
    };
    me.create = {
        set: function (object) {
            me.ui.element.create([{
                    "ui.style.display": "flex",
                    "ui.style.flex": "1",
                    "ui.basic.elements": [
                        {
                            "ui.theme.class": "border",
                            "ui.basic.var": "content"
                        },
                        {
                            "ui.element.component": "widget.scrollbar.vertical"
                        }
                    ]
                },
                {
                    "ui.style.display": "flex",
                    "ui.style.flex": "none",
                    "ui.basic.elements": [
                        {
                            "ui.element.component": "widget.scrollbar.horizontal"
                        },
                        {
                            "ui.theme.class": "widget.scrollbar.corner"
                        }
                    ]
                }
            ], object);
        }
    };
    me.content = function (object) {
        return object.var.content;
    };
};
