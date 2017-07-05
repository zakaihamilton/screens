/*
 @author Zakai Hamilton
 @component WidgetText
 */

package.widget.terminal = function WidgetText(me) {
    me.default = {
        "ui.theme.class": "normal",
        "ui.basic.tag":"div",
        "ui.basic.var": "terminal",
        "ui.style.background": "black",
        "ui.style.textColor": "white",
        "ui.style.textSize": "1em",
        "ui.style.width": "100%",
        "ui.style.height": "100%",
        "ui.style.fontFamily": "Monaco, Courier",
        "ui.style.margin": "0",
        "ui.basic.elements": [
            {
                "ui.basic.var": "innerWindow",
                "ui.basic.tag":"div",
                "ui.style.padding": "10px",
                "ui.basic.elements": [
                    {
                        "ui.basic.var": "output",
                        "ui.basic.tag": "p",
                        "ui.style.margin": "0",
                        "ui.style.color":"white"
                    },
                    {
                        "ui.basic.var": "input",
                        "ui.basic.tag": "p",
                        "ui.style.margin": "0",
                        "ui.style.display": "none",
                        "ui.style.color":"white",
                        "ui.basic.elements": [
                            {
                                "ui.basic.var": "inputLine",
                                "ui.basic.tag": "span"
                            },
                            {
                                "ui.basic.var": "cursor",
                                "ui.basic.tag": "span",
                                "ui.style.background": "white",
                                "ui.basic.text": "C",
                                "ui.style.display": "none",
                                "ui.style.color":"white"
                            }
                        ]
                    }
                ]
            }
        ]
    };
    me.sendInput = function (terminal, message, type) {
        var field = me.ui.element.create({
            "ui.basic.tag": "input",
            "ui.style.position": "absolute",
            "ui.style.zIndex": "-100",
            "ui.style.outline": "none",
            "ui.style.border": "none",
            "ui.style.opacity": "0",
            "ui.style.fontSize": "0.2em"
        }, terminal);
        me.set(terminal.var.inputLine, "ui.basic.text", "");
        me.set(terminal.var.input, "ui.style.display", "block");
        me.blinkCursor(terminal, field);
        if (message.length) {
            me.set(terminal, "print", message);
        }
        field.onblur = function () {
            me.set(terminal.var.cursor, "ui.style.display", "none");
        };
        field.onfocus = function () {
            field.value = me.get(terminal.var.inputLine, "ui.basic.text");
            me.set(terminal.var.cursor, "ui.style.display", "inline");
        };
        terminal.onclick = function () {
            field.focus();
        };
        field.onkeydown = function (e) {
            if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
                e.preventDefault();
            } else if (type === "input" && e.which !== 13) {
                setTimeout(function () {
                    me.set(terminal.var.inputLine, "ui.basic.text", field.value);
                }, 1);
            }
        };
        field.onkeyup = function (e) {
            if (e.which === 13) {
                me.set(terminal.var.input, "ui.style.display", "none");
                if (type === "input") {
                    me.set(terminal, "print", field.value);
                }
                me.set(field, "ui.node.parent", null);
                me.set(terminal, terminal.response, field.value);
            }
        };
        if (!terminal.running) {
            terminal.running = true;
            setTimeout(function () {
                field.focus();
            }, 50);
        } else {
            field.focus();
        }
    };
    me.blinkCursor = function (terminal, field) {
        var cursor = terminal.var.cursor;
        setTimeout(function () {
            if (field.parentElement) {
                var visibility = me.get(cursor, "ui.style.visibility");
                me.set(cursor, "ui.style.visibility", visibility === "visible" ? "hidden" : "visible");
                me.blinkCursor(terminal, field);
            } else {
                me.set(cursor, "ui.style.visibility", "visible");
            }
        }, 500);
    };
    me.clear = {
        set: function (terminal) {
            me.set(terminal.var.output, "ui.basic.text", "");
        }
    };
    me.response = {
        set: function (terminal, response) {
            terminal.response = response;
        }
    };
    me.print = {
        set: function (terminal, message) {
            me.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.text": message,
            }, terminal.var.output);
        }
    };
    me.input = {
        set: function (terminal, message) {
            me.sendInput(terminal, message, "input");
        }
    };
    me.password = {
        set: function (terminal, message) {
            me.sendInput(terminal, message, "password");
        }
    };
};
