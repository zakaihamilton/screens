/*
 @author Zakai Hamilton
 @component WidgetTerminal
 */

screens.widget.terminal = function WidgetTerminal(me) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
    };
    me.timeout = 5000;
    me.sendInput = function (terminal, message, type) {
        var window = me.widget.window.get(terminal);
        var field = me.ui.element.create({
            "ui.basic.tag": "input",
            "ui.class.class": "widget.terminal.field"
        }, window);
        terminal.field = field;
        me.core.property.set(terminal.var.inputLine, "ui.basic.text", "");
        me.core.property.set(terminal.var.input, "ui.style.display", "block");
        clearTimeout(terminal.cursorTimeout);
        terminal.cursorTimeout = null;
        me.core.property.set(terminal, "scroll");
        if (message.length) {
            me.core.property.set(terminal.var.prefix, "ui.basic.text", message);
        }
        field.onblur = function () {
            me.core.property.set(terminal.var.cursor, "ui.style.display", "none");
            clearTimeout(terminal.cursorTimeout);
            terminal.cursorTimeout = null;
        };
        field.onfocus = function () {
            field.value = me.core.property.get(terminal.var.inputLine, "ui.basic.text");
            me.core.property.set(terminal.var.cursor, "ui.style.display", "inline");
            me.blinkCursor(terminal, field);
        };
        window.onclick = function () {
            if (!terminal.cursorTimeout) {
                setTimeout(() => {
                    field.focus();
                }, me.timeout);
            }
        };
        field.onkeydown = function (e) {
            if (e.which === 37 || e.which === 39 || e.which === 40 || e.which === 9) {
                e.preventDefault();
            } else if (e.which === 38) {
                e.preventDefault();
                if (terminal.lastCommand) {
                    me.core.property.set(terminal.var.inputLine, "ui.basic.text", terminal.lastCommand);
                    field.value = terminal.lastCommand;
                }
            }
            else if (type === "input" && e.which !== 13) {
                setTimeout(function () {
                    me.core.property.set(terminal.var.inputLine, "ui.basic.text", field.value);
                    me.core.property.set(terminal, "scroll");
                }, 1);
            }
        };
        field.onkeyup = function (e) {
            if (e.which === 13) {
                me.core.property.set(terminal.var.input, "ui.style.display", "none");
                if (type === "input") {
                    me.core.property.set(terminal, "print", message + field.value);
                }
                me.core.property.set(field, "ui.node.parent");
                terminal.lastCommand = field.value;
                me.core.property.set(terminal, terminal.response, field.value);
            }
        };
        if (!terminal.running) {
            terminal.running = true;
            setTimeout(function () {
                field.focus();
            }, 500);
        } else {
            field.focus();
        }
    };
    me.blinkCursor = function (terminal, field) {
        var cursor = terminal.var.cursor;
        terminal.cursorTimeout = setTimeout(function () {
            if (field.parentElement) {
                var visibility = me.core.property.get(cursor, "ui.style.visibility");
                me.core.property.set(cursor, "ui.style.visibility", visibility === "visible" ? "hidden" : "visible");
                me.blinkCursor(terminal, field);
            } else {
                me.core.property.set(cursor, "ui.style.visibility", "visible");
            }
        }, 500);
    };
    me.clear = {
        set: function (terminal) {
            me.core.property.set(terminal.var.output, "ui.basic.text", "");
        }
    };
    me.response = {
        set: function (terminal, response) {
            terminal.response = response;
        }
    };
    me.insert = {
        set: function (terminal, message) {
            var print = me.ui.node.lastChild(terminal.var.output);
            if (print) {
                var text = me.core.property.get(print, "ui.basic.text");
                text += message;
                me.core.property.set(print, "ui.basic.text", text);
            }
            else {
                me.ui.element.create({
                    "ui.basic.tag": "div",
                    "ui.basic.text": message
                }, terminal.var.output);
            }
            me.core.property.set(terminal, "scroll");
        }
    };
    me.print = {
        set: function (terminal, message) {
            me.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.text": message
            }, terminal.var.output);
            me.core.property.set(terminal, "scroll");
        }
    };
    me.scroll = {
        set: function (terminal) {
            var container = me.ui.node.container(terminal, me.widget.container.id);
            container.scrollTop = container.scrollHeight;
            me.core.property.notify(container, "update");
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
    me.focus = {
        set: function (terminal) {
            if (terminal.field) {
                terminal.field.focus();
            }
        }
    };
};
