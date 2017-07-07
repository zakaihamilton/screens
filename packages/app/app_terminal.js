/*
 @author Zakai Hamilton
 @component AppTerminal
 */

package.app.terminal = function (me) {
    me.require = {platform: "browser"};
    me.init = function () {
        var terminal = me.ui.element.create([
            {
                "title": "Terminal",
                "ui.style.left": "350px",
                "ui.style.top": "100px",
                "ui.style.width": "300px",
                "ui.style.height": "300px",
                "icon": "/packages/res/icons/terminal.png",
                "ui.style.background":"black",
                "ui.basic.elements": [
                    {
                        "ui.element.component":"widget.terminal",
                        "widget.terminal.response":"app.terminal.response",
                        "widget.terminal.input":"C>"
                    }
                ]
            }
        ]);
    };
    me.response = {
        set: function(object, value) {
            me.core.cmd.handle(object, value);
        }
    };
};
