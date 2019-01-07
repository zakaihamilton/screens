/*
 @author Zakai Hamilton
 @component AppLinks
 */

screens.app.links = function AppLinks(me) {
    me.init = function () {
        me.ui.content.attach(me);
    };
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var window = me.ui.element.create(__json__, "workspace", "self");
        if (typeof args[0] === "string") {
            me.content.import(window, args[0], args[1]);
        }
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.ui.options.load(me, window, {
                border: true,
                editMode: false
            });
            me.ui.options.toggleSet(me, null, {
                "border": me.reload,
                "editMode": me.reload
            });
            me.ui.options.choiceSet(me, null, {
                "fontSize": (object, value) => {
                    var window = me.widget.window.get(object);
                    me.core.property.set(window.var.links, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            });
            window.rowCount = 20;
            window.columnCount = 2;
            me.core.property.set(window, "app", me);
        }
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "name", "");
        window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
        me.reload(window);
    };
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "widget.window.name", title);
        window.links = JSON.parse(text);
        if (!options) {
            options = {};
        }
        window.links_options = options;
        me.reload(window);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        return [JSON.stringify(window.links), window.links_options];
    };
    me.attributes = function (dict) {
        var attributes = "";
        for (const [key, value] of Object.entries(dict)) {
            attributes += " " + key + "=\"" + value + "\" ";
        }
        return attributes;
    };
    me.rename = function (object) {
        var window = me.widget.window.get(object);
        var title = object.value;
        me.core.property.set(window, "name", title);
    };
    me.store = function (object) {
        var window = me.widget.window.get(object);
        var rowIndex = parseInt(me.core.property.get(object, "ui.attribute.rowIndex"));
        var columnIndex = parseInt(me.core.property.get(object, "ui.attribute.columnIndex"));
        var cell = window.cells[rowIndex][columnIndex];
        if (!cell) {
            cell = window.cells[rowIndex][columnIndex] = {};
        }
        cell.value = object.value;
    };
    me.links = function (object) {
        var html = "";
        var window = me.widget.window.get(object);
        var editMode = window.options.editMode;
        for (var link of window.links) {
            var attributes = me.attributes(Object.assign({ target: "_blank" }, link.attributes));
            html += "<a " + attributes + ">" + link.label + "</a><br>";
        }
        return html;
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window.var.links, {
            "ui.style.fontSize": window.options.fontSize,
            "ui.class.edit-mode": window.options.editMode
        });
        if (!window.links) {
            window.links = [];
        }
        if (!window.links_options) {
            window.links_options = {};
        }
        var html = me.links(window);
        me.core.property.set(window.var.links, "ui.basic.html", html);
        me.core.property.notify(window, "update");
    };
};
