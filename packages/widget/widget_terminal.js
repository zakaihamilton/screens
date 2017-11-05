/*
 @author Zakai Hamilton
 @component WidgetTerminal
 */

package.widget.terminal = function WidgetTerminal(me) {
    me.default = __json__;
    me.sendInput = function (terminal, message, type) {
        var window = me.package.widget.window.window(terminal);
        var field = me.package.ui.element.create({
            "ui.basic.tag": "input",
            "ui.class.class":"widget.terminal.field"
        }, window);
        terminal.field = field;
        me.package.core.property.set(terminal.var.inputLine, "ui.basic.text", "");
        me.package.core.property.set(terminal.var.input, "ui.style.display", "block");
        clearTimeout(terminal.cursorTimeout);
        me.package.core.property.set(terminal, "scroll");
        if (message.length) {
            me.package.core.property.set(terminal.var.prefix, "ui.basic.text", message);
        }
        field.onblur = function () {
            me.package.core.property.set(terminal.var.cursor, "ui.style.display", "none");
            clearTimeout(terminal.cursorTimeout);
        };
        field.onfocus = function () {
            field.value = me.package.core.property.get(terminal.var.inputLine, "ui.basic.text");
            me.package.core.property.set(terminal.var.cursor, "ui.style.display", "inline");
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
                    me.package.core.property.set(terminal.var.inputLine, "ui.basic.text", field.value);
                    me.package.core.property.set(terminal, "scroll");
                }, 1);
            }
        };
        field.onkeyup = function (e) {
            if (e.which === 13) {
                me.package.core.property.set(terminal.var.input, "ui.style.display", "none");
                if (type === "input") {
                    me.package.core.property.set(terminal, "print", message + field.value);
                }
                me.package.core.property.set(field, "ui.node.parent");
                me.package.core.property.set(terminal, terminal.response, field.value);
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
                var visibility = me.package.core.property.get(cursor, "ui.style.visibility");
                me.package.core.property.set(cursor, "ui.style.visibility", visibility === "visible" ? "hidden" : "visible");
                me.blinkCursor(terminal, field);
            } else {
                me.package.core.property.set(cursor, "ui.style.visibility", "visible");
            }
        }, 500);
    };
    me.clear = {
        set: function (terminal) {
            me.package.core.property.set(terminal.var.output, "ui.basic.text", "");
        }
    };
    me.response = {
        set: function (terminal, response) {
            terminal.response = response;
        }
    };
    me.print = {
        set: function (terminal, message) {
            var print = me.package.ui.element.create({
                "ui.basic.tag": "div",
                "ui.basic.text": message
            }, terminal.var.output);
            me.package.core.property.set(terminal, "scroll");
        }
    };
    me.scroll = {
        set: function(terminal) {
            var container = me.package.ui.node.container(terminal, me.package.widget.container.id);
            var content = me.package.widget.container.content(container);
            content.scrollTop = content.scrollHeight;
            me.package.core.property.notify(container, "update");
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
        set: function(terminal) {
            if(terminal.field) {
                terminal.field.focus();
            }
        }
    };
};
