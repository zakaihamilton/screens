/*
 @author Zakai Hamilton
 @component WidgetContent
 */

package.widget.content = function WidgetContent(me) {
    me.default = {
        "ui.basic.tag": "div",
        "ui.style.display": "flex",
        "ui.style.flex": "1",
        "ui.style.flex-direction": "column",
        "ui.basic.elements": [
            {
                "ui.style.display": "flex",
                "ui.style.flex": "1",
                "ui.basic.elements": [
                    {
                        "ui.theme.class": "widget.content.border",
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
        ]
    };
};
