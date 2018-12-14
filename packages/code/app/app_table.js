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
        if (typeof args[0] === "string") {
            me.importItem(window, args[0]);
        }
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, {
                    border: true,
                    editMode: false,
                    autoComplete: true,
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
                "border": me.reload.set,
                "editMode": me.reload.set,
                "autoComplete": me.reload.set,
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
            window.rowCount = 20;
            window.columnCount = 10;
            window.language = "english";
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
    me.importData = function (object, text, title, options) {
        var window = me.widget.window.get(object);
        me.core.property.set(window, "title", title);
        var cells = JSON.parse(text);
        window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
        for (var cell of cells) {
            window.cells[cell.row][cell.column] = { value: cell.text };
        }
        if (!options) {
            options = {};
        }
        window.table_options = options;
        me.reload.set(window);
    };
    me.exportData = function (object) {
        var window = me.widget.window.get(object);
        var title = me.core.property.get(window, "title");
        var data = [];
        window.cells.map((row, rowIndex) => {
            row.map((column, columnIndex) => {
                if (column.value) {
                    data.push({
                        row: rowIndex,
                        column: columnIndex,
                        text: column.value
                    });
                }
            });
        });
        if (!data.length) {
            return [];
        }
        return [JSON.stringify(data), title, window.table_options];
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
        for (var columnIndex = 0; columnIndex < window.columnCount + countOffset; columnIndex++) {
            for (var rowIndex = 0; rowIndex < window.rowCount + countOffset; rowIndex++) {
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
                var classes = ["app-table-cell"];
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
                    if (window.options.border) {
                        classes.push("border");
                    }
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
                    classes.push("input");
                    styles.push("font-size:1em");
                    if (window.table_options.lock) {
                        attributes.readonly = true;
                    }
                }
                if (rowIndex > 0 || !editMode) {
                    attributes.rowIndex = rowIndex - countOffset;
                }
                if (columnIndex > 0 || !editMode) {
                    attributes.columnIndex = columnIndex - countOffset;
                }
                if (!header && cell.value) {
                    attributes.value = cell.value;
                }
                else if (!rowIndex && !columnIndex) {
                    attributes.value = me.core.property.get(window, "title");
                }
                if (attributes.rowIndex === 0 && window.table_options.rowHeader) {
                    classes.push("rowHeader");
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
                else if (window.options.autoComplete && rowIndex && columnIndex) {
                    attributes.list = "terms";
                }
                html += "<" + tag + me.attributes(attributes) + ">" + value + "</" + tag + ">";
            }
        }
        if (window.options.autoComplete && editMode && window.terms) {
            html += "<datalist id=\"terms\">";
            html += window.terms.filter(term => term.match(/^[A-Z,a-z]/)).sort().map(term => "<option value=\"" + term + "\"></option>").join("\n");
        }
        return html;
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            var language = window.language.toLowerCase();
            if (language === "auto") {
                language = "english";
            }
            if (language) {
                window.terms = await me.kab.data.terms(language);
            }
            me.core.property.set(window.var.table, {
                "ui.style.fontSize": window.options.fontSize,
                "ui.class.edit-mode": window.options.editMode
            });
            if (!window.cells) {
                window.cells = Array.from(Array(window.rowCount), () => new Array(window.columnCount));
            }
            if (!window.table_options) {
                window.table_options = {};
            }
            var html = await me.rows(window);
            me.core.property.set([window.var.table, window.var.table], {
                "ui.basic.html": html
            });
            me.core.property.notify(window, "update");
        }
    };
    me.copyUrl = {
        get: function (object) {
            var window = me.widget.window.get(object);
            var title = me.core.property.get(window, "title");
            return title !== "Table";
        },
        set: function (object) {
            var window = me.widget.window.get(object);
            var title = me.core.property.get(window, "title");
            me.core.util.copyUrl("table", [title]);
        }
    };
    me.lock = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return window.table_options.lock;
        },
        set: function (object) {
            var window = me.widget.window.get(object);
            window.table_options.lock = !window.table_options.lock;
            me.reload.set(window);
        }
    };
    me.rowHeader = {
        get: function (object) {
            var window = me.widget.window.get(object);
            return window.table_options.rowHeader;
        },
        set: function (object) {
            var window = me.widget.window.get(object);
            window.table_options.rowHeader = !window.table_options.rowHeader;
            me.reload.set(window);
        }
    };
};
