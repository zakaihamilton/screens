/*
 @author Zakai Hamilton
 @component AppTable
 */

screens.app.table = function AppTable(me) {
    me.init = function () {
        me.ui.content.attach(me);
        me.updateContentList();
    };
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var window = me.ui.element.create(__json__, "workspace", "self");
        window.language = "english";
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, {
                    editMode: false,
                    doTranslation: true,
                    doExplanation: true,
                    prioritizeExplanation: true,
                    addStyles: true,
                    abridged: false,
                    keepSource: false,
                    category: true,
                    headings: true,
                    subHeadings: true,
                    language: "Auto",
                    fontSize: "18px",
                    phaseNumbers: true,
                    animation: true,
                    autoRotate: false
                });
            }
            me.ui.options.toggleSet(me, null, {
                "editMode": me.reload.set,
                "doTranslation": me.reload.set,
                "doExplanation": me.reload.set,
                "prioritizeExplanation": me.reload.set,
                "addStyles": me.reload.set,
                "phaseNumbers": me.reload.set,
                "keepSource": me.reload.set,
                "abridged": me.reload.set,
                "pages": me.reload.set,
                "columns": me.reload.set,
                "category": me.reload.set,
                "headings": me.reload.set,
                "subHeadings": me.reload.set,
                "animation": me.reload.set,
                "autoRotate": me.update
            });
            me.ui.options.choiceSet(me, null, {
                "language": me.reload.set,
                "fontSize": (object, value) => {
                    var window = me.widget.window.get(object);
                    me.core.property.set(window.var.table, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            });
            me.ui.class.useStylesheet("kab");
            window.options.clickCallback = "screens.widget.transform.openPopup";
            me.core.property.set(window, "app", me);
        }
    };
    me.clear = function (object) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "title", "Table");
        window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
        me.reload.set(window);
    };
    me.importData = function (object, text, title) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "title", title);
        var cells = JSON.parse(text);
        window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
        for (var cell of cells) {
            window.cells[cell.row][cell.column] = { value: cell.text };
        }
        me.reload.set(window);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var title = me.core.property.get(window, "title");
        var data = [];
        window.cells.map((row, rowIndex) => {
            row.map((column, columnIndex) => {
                data.push({
                    row: rowIndex,
                    column: columnIndex,
                    text: column.value
                });
            });
        });
        return [JSON.stringify(data), title];
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
        if (!title) {
            title = "Table";
        }
        me.core.property.set(window, "title", title);
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
    me.rows = async function (object) {
        var html = "";
        var window = me.widget.window.get(object);
        var editMode = window.options.editMode;
        var cellOffset = 1;
        var countOffset = editMode ? 1 : 0;
        for (var rowIndex = 0; rowIndex < window.rowCount + countOffset; rowIndex++) {
            for (var columnIndex = 0; columnIndex < window.columnCount + countOffset; columnIndex++) {
                var cell = {};
                if (!editMode || (rowIndex && columnIndex)) {
                    cell = window.cells[rowIndex - countOffset][columnIndex - countOffset];
                }
                if (!cell) {
                    cell = {};
                }
                if (!cell.value && !editMode) {
                    continue;
                }
                var styles = ["grid-column:" + (columnIndex + cellOffset), "grid-row:" + (rowIndex + cellOffset)];
                var classes = ["app-table-row"];
                var attributes = {};
                var header = null;
                if (editMode) {
                    if (!rowIndex && !columnIndex) {
                        header = "";
                    }
                    else if (!rowIndex) {
                        header = columnIndex;
                    }
                    else if (!columnIndex) {
                        header = rowIndex;
                    }
                    styles.push("height:2em");
                }
                else {
                    styles.push("height:3em");
                }
                if (header) {
                    classes.push("header");
                }
                else if (editMode) {
                    if (!rowIndex && !columnIndex) {
                        attributes.oninput = "screens.app.table.rename(this)";
                    }
                    else {
                        attributes.oninput = "screens.app.table.store(this)";
                    }
                    classes.push("edit-mode");
                    styles.push("font-size:1em");
                }
                if (rowIndex > 0) {
                    attributes.rowIndex = rowIndex - countOffset;
                }
                if (columnIndex > 0) {
                    attributes.columnIndex = columnIndex - countOffset;
                }
                if (!header && cell.value) {
                    attributes.value = cell.value;
                }
                else if (!rowIndex && !columnIndex) {
                    attributes.value = me.core.property.get(window, "title");
                }
                attributes.class = classes.join(" ");
                attributes.style = styles.join(";");
                var tag = editMode && !header ? "input" : "div";
                var value = "";
                if (!editMode) {
                    value = await me.core.property.get(window, "widget.transform.term", cell.value);
                }
                else if (header) {
                    value = header;
                }
                html += "<" + tag + me.attributes(attributes) + ">" + value + "</" + tag + ">";
            }
        }
        return html;
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.table, "ui.style.fontSize", window.options.fontSize);
            me.core.property.set(window.var.table, "ui.class.edit-mode", window.options.editMode);
            window.rowCount = 20;
            window.columnCount = 10;
            if (!window.cells) {
                window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
            }
            var html = await me.rows(window);
            me.core.property.set([window.var.table, window.var.table], {
                "ui.basic.html": html
            });
            me.core.property.notify(window, "update");
        }
    };
};
