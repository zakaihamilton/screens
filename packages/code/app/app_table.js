/*
 @author Zakai Hamilton
 @component AppPrism
 */

screens.app.table = function AppPrism(me) {
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
                    me.core.property.set(window.var.table, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            });
            me.ui.class.useStylesheet("kab");
            window.options.clickCallback = "screens.app.table.openPopup";
            me.core.property.set(window, "app", me);
        }
    };
    me.update = function (object) {
        var window = me.widget.window.get(object);
        var autoRotate = window.options.autoRotate;
        var viewer = window.var.table;
        if (autoRotate) {
            var animate = () => {
                if (!viewer.rotateAngle) {
                    viewer.rotateAngle = 0;
                }
                var angle = viewer.rotateAngle + (viewer.rotateDirection ? 1 : -1);
                me.rotate(window, angle);
                if (angle !== viewer.rotateAngle) {
                    viewer.rotateDirection = !viewer.rotateDirection;
                }
                return !window.options.autoRotate;
            };
            me.core.util.animate(animate, 10);
        }
    };
    me.attributes = function (dict) {
        var attributes = "";
        for (const [key, value] of Object.entries(dict)) {
            attributes += " " + key + "=\"" + value + "\" ";
        }
        return attributes;
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
        for (var rowIndex = 0; rowIndex < window.rowCount; rowIndex++) {
            for (var columnIndex = 0; columnIndex < window.columnCount; columnIndex++) {
                var cell = window.cells[rowIndex][columnIndex];
                if (!cell) {
                    cell = {};
                }
                if (!cell.value && !editMode) {
                    continue;
                }
                var styles = ["grid-column:" + (columnIndex + 1), "grid-row:" + (rowIndex + 1)];
                var classes = ["app-table-row"];
                var attributes = {};
                styles.push("width:auto");
                if (editMode) {
                    styles.push("height:40px");
                }
                else {
                    styles.push("height:3em");
                }
                styles.push("transform: translateZ(30px)");
                styles.push("margin:3px");
                if (editMode) {
                    attributes.oninput = "screens.app.table.store(this)";
                    classes.push("editMode");
                }
                attributes.rowIndex = rowIndex;
                attributes.columnIndex = columnIndex;
                if (cell.value) {
                    attributes.value = cell.value;
                }
                attributes.class = classes.join(";");
                attributes.style = styles.join(";");
                var tag = editMode ? "input" : "div";
                var value = editMode ? "" : await me.core.property.get(window, "app.table.term", cell.value);
                html += "<" + tag + me.attributes(attributes) + ">" + value + "</" + tag + ">";
            }
        }
        return html;
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.table, "ui.style.fontSize", window.options.fontSize);
            me.core.property.set(window.var.table, "ui.class.editMode", window.options.editMode);
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
    me.term = async function (object, text) {
        var window = me.widget.window.get(object);
        var array = text;
        if (!Array.isArray(text)) {
            array = [text];
        }
        var result = await me.core.util.map(array, async (text) => {
            var info = await me.kab.text.parse(window.language, text, window.options);
            if (!window.terms) {
                window.terms = {};
            }
            window.terms = Object.assign(window.terms, info.terms);
            return info.text;
        });
        return result.join("<br>");
    };
    me.openPopup = function (object, termName) {
        var window = me.widget.window.get(object);
        var foundTermName = Object.keys(window.terms).find((term) => {
            return term.replace(/ /g, "") === termName;
        });
        if (foundTermName && termName !== foundTermName) {
            termName = foundTermName;
        }
        var term = window.terms[termName];
        if (!term) {
            return;
        }
        var widgets = me.ui.node.bind(window.var.popup, term, {
            term: ".text",
            phase: ".phase|.phase.minor",
            hebrew: ".item.hebrew",
            translation: ".item.translation",
            explanation: ".item.explanation",
            category: ".category",
            source: ".source"
        }, "None");
        for (var name in widgets) {
            var child = widgets[name];
            if (child) {
                child.parentNode.style.display = child.innerText === "None" ? "none" : "";
            }
        }
        var phase = widgets.phase.innerText.toLowerCase();
        var classes = "title widget-transform-level ";
        if (phase !== "root") {
            classes += "kab-term-phase-" + phase;
        }
        me.core.property.set(widgets.phase, "ui.class.class", classes);
        me.core.property.set(window.var.popup, "ui.class.add", "is-active");
    };
};
