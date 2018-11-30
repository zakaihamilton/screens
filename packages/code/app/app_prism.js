/*
 @author Zakai Hamilton
 @component AppPrism
 */

screens.app.prism = function AppPrism(me) {
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
                    viewType: "Layers",
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
                    phaseNumbers: true
                });
            }
            me.ui.options.toggleSet(me, null, {
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
                "subHeadings": me.reload.set
            });
            me.ui.options.choiceSet(me, null, {
                "viewType": me.reload.set,
                "language": me.reload.set,
                "fontSize": (object, value) => {
                    me.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            });
            me.ui.class.useStylesheet("kab");
            window.options.clickCallback = "screens.app.prism.openPopup";
        }
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            var root = me.kab.form.root();
            me.core.property.set(window.var.viewer, "ui.basic.html", me.kab.draw.form(root));
            me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
            me.core.property.notify(window, "app.prism.refresh");
        }
    };
    me.term = {
        set: async function (object, text) {
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
            me.core.property.set(object, "ui.basic.html", result.join("<br>"));
            me.core.property.notify(window, "update");
        }
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
        var widgets = me.ui.node.bind(window, term, {
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
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.viewer, {
                "ui.basic.html": null,
                "ui.class.class": "app.prism." + window.options.viewType.toLowerCase()
            });
            var diagramData = me.core.property.get(window, "app.prism.diagramData");
            me.ui.element.create(diagramData.layers, window.var.viewer);
            if (diagramData.title) {
                me.core.property.set(window, "title", diagramData.title);
            }
            me.core.property.notify(window, "update");
        }
    };
};
