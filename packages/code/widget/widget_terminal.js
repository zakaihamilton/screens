/*
 @author Zakai Hamilton
 @component WidgetTerminal
 */

screens.widget.terminal = function WidgetTerminal(me, { core, ui, widget }) {
    me.init = function () {
        me.element = {
            properties: me.json
        };
    };
    me.timeout = 5000;
    me.sendInput = function (terminal, message, type) {
        var window = widget.window.get(terminal);
        var field = ui.element.create({
            "ui.basic.tag": "input",
            "ui.class.class": "widget.terminal.field"
        }, window);
        terminal.field = field;
        core.property.set(terminal.var.inputLine, "ui.basic.text", "");
        core.property.set(terminal.var.input, "ui.style.display", "block");
        clearTimeout(terminal.cursorTimeout);
        terminal.cursorTimeout = null;
        core.property.set(terminal, "scroll");
        if (message.length) {
            core.property.set(terminal.var.prefix, "ui.basic.text", message);
        }
        field.onblur = function () {
            core.property.set(terminal.var.cursor, "ui.style.display", "none");
            clearTimeout(terminal.cursorTimeout);
            terminal.cursorTimeout = null;
        };
        field.onfocus = function () {
            field.value = core.property.get(terminal.var.inputLine, "ui.basic.text");
            core.property.set(terminal.var.cursor, "ui.style.display", "inline");
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
                    core.property.set(terminal.var.inputLine, "ui.basic.text", terminal.lastCommand);
                    field.value = terminal.lastCommand;
                }
            }
            else if (type === "input" && e.which !== 13) {
                setTimeout(function () {
                    core.property.set(terminal.var.inputLine, "ui.basic.text", field.value);
                    core.property.set(terminal, "scroll");
                }, 1);
            }
        };
        field.onkeyup = function (e) {
            if (e.which === 13) {
                core.property.set(terminal.var.input, "ui.style.display", "none");
                if (type === "input") {
                    core.property.set(terminal, "print", message + field.value);
                }
                core.property.set(field, "ui.node.parent");
                terminal.lastCommand = field.value;
                core.property.set(terminal, terminal.response, field.value);
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
                var visibility = core.property.get(cursor, "ui.style.visibility");
                core.property.set(cursor, "ui.style.visibility", visibility === "visible" ? "hidden" : "visible");
                me.blinkCursor(terminal, field);
            } else {
                core.property.set(cursor, "ui.style.visibility", "visible");
            }
        }, 500);
    };
    me.clear = {
        set: function (terminal) {
            core.property.set(terminal.var.output, "ui.basic.text", "");
        }
    };
    me.response = {
        set: function (terminal, response) {
            terminal.response = response;
        }
    };
    me.insert = {
        set: function (terminal, message) {
            var print = ui.node.lastChild(terminal.var.output);
            if (print) {
                var text = core.property.get(print, "ui.basic.text");
                text += message;
                core.property.set(print, "ui.basic.text", text);
            }
            else {
                ui.element.create({
                    "ui.basic.tag": "div",
                    "ui.basic.text": message
                }, terminal.var.output);
            }
            core.property.set(terminal, "scroll");
        }
    };
    me.print = {
        set: function (terminal, message) {
            ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.text": message
            }, terminal.var.output);
            core.property.set(terminal, "scroll");
        }
    };
    me.scroll = {
        set: function (terminal) {
            var container = ui.node.container(terminal, widget.container.id);
            container.scrollTop = container.scrollHeight;
            core.property.notify(container, "update");
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
