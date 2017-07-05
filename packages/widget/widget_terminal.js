/*
 @author Zakai Hamilton
 @component WidgetTerminal
 */

package.widget.terminal = function WidgetTerminal(me) {
    me.default = {
        "ui.theme.class": "background",
        "ui.basic.var": "terminal",
        "ui.basic.tag":"div",
        "ui.basic.elements": [
            {
                "ui.basic.tag":"div",
                "ui.theme.class": "content",
                "ui.basic.elements": [
                    {
                        "ui.basic.var": "output",
                        "ui.basic.tag": "p",
                        "ui.theme.class": "output",
                    },
                    {
                        "ui.basic.var": "input",
                        "ui.basic.tag": "p",
                        "ui.theme.class": "input",
                        "ui.basic.elements": [
                            {
                                "ui.basic.var": "prefix",
                                "ui.theme.class": "prefix",
                                "ui.basic.tag": "span"
                            },
                            {
                                "ui.basic.var": "inputLine",
                                "ui.basic.tag": "span"
                            },
                            {
                                "ui.basic.var": "cursor",
                                "ui.basic.tag": "span",
                                "ui.theme.class": "cursor",
                                "ui.basic.text": "C",
                            }
                        ]
                    }
                ]
            }
        ]
    };
    me.sendInput = function (terminal, message, type) {
        var window = me.widget.window.window(terminal);
        var field = me.ui.element.create({
            "ui.basic.tag": "input",
            "ui.theme.class":"widget.terminal.field"
        }, window);
        me.set(terminal.var.inputLine, "ui.basic.text", "");
        me.set(terminal.var.input, "ui.style.display", "block");
        clearTimeout(terminal.cursorTimeout);
        me.set(terminal, "scroll", null);
        if (message.length) {
            me.set(terminal.var.prefix, "ui.basic.text", message);
        }
        field.onblur = function () {
            me.set(terminal.var.cursor, "ui.style.display", "none");
            clearTimeout(terminal.cursorTimeout);
        };
        field.onfocus = function () {
            field.value = me.get(terminal.var.inputLine, "ui.basic.text");
            me.set(terminal.var.cursor, "ui.style.display", "inline");
            me.blinkCursor(terminal, field);
        };
        window.onclick = function () {
            field.focus();
        };
        field.onkeydown = function (e) {
            if (e.which === 37 || e.which === 39 || e.which === 38 || e.which === 40 || e.which === 9) {
                e.preventDefault();
            } else if (type === "input" && e.which !== 13) {
                setTimeout(function () {
                    me.set(terminal.var.inputLine, "ui.basic.text", field.value);
                    me.set(terminal, "scroll", null);
                }, 1);
            }
        };
        field.onkeyup = function (e) {
            if (e.which === 13) {
                me.set(terminal.var.input, "ui.style.display", "none");
                if (type === "input") {
                    me.set(terminal, "print", message + field.value);
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
        terminal.cursorTimeout = setTimeout(function () {
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
            var print = me.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.text": message,
            }, terminal.var.output);
            me.set(terminal, "scroll", null);
        }
    };
    me.scroll = {
        set: function(terminal) {
            var container = me.ui.node.container(terminal, me.widget.container.id);
            var content = me.widget.container.content(container);
            content.scrollTop = content.scrollHeight;
            me.ui.property.broadcast(container, "draw", null);
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
