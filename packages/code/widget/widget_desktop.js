/*
 @author Zakai Hamilton
 @component WidgetDesktop
 */

screens.widget.desktop = function WidgetDesktop(me, packages) {
    const { core, ui } = packages;
    me.element = {
        properties: {
            "ui.basic.tag": "div",
            "ui.class.class": "container",
            "ui.basic.elements": [
                {
                    "ui.element.component": "widget.taskbar",
                    "ui.basic.var": "bar"
                },
                {
                    "ui.basic.tag": "div",
                    "ui.basic.var": "workspace",
                    "ui.class.class": "workspace",
                    "ui.basic.elements": [
                        {
                            "ui.basic.tag": "img",
                            "ui.class.class": "background",
                            "ui.basic.src": "desktop",
                            "ui.touch.dblclick": "core.app.launcher"
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.class.class": "widget.window.align",
                            "ui.basic.var": "align"
                        },
                        {
                            "ui.basic.tag": "div",
                            "ui.element.component": "widget.toast",
                            "ui.basic.var": "toast"
                        }
                    ]
                }
            ]
        }
    };
    me.reload = function () {
        ui.modal.launch("question", {
            "title": "Reload",
            "question": "Do you want to reload Screens?"
        }).then(() => {
            core.util.reload();
        }).catch(() => {

        });
    };
};
