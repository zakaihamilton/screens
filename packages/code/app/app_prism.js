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
                    animation: true
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
                "subHeadings": me.reload.set,
                "animation": me.reload.set
            });
            me.ui.options.choiceSet(me, null, {
                "language": me.reload.set,
                "fontSize": (object, value) => {
                    me.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            });
            me.ui.class.useStylesheet("kab");
            window.options.clickCallback = "screens.app.prism.openPopup";
            me.core.property.set(window, "app", me);
        }
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            var root = me.kab.form.root();
            var list = me.kab.draw.list(root, []);
            var html = await me.kab.draw.html(window, list, window.options);
            me.core.property.set(window.var.viewer, "ui.basic.html", html);
            me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
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
    me.rotate = function(object, event) {
        if(event.type === me.ui.touch.eventNames["down"]) {
            me.core.property.set(object, {
                "ui.touch.move": "app.prism.rotate",
                "ui.touch.up": "app.prism.rotate"
            });
            object.rotate_left = event.clientX;
            object.rotate_top = event.clientY;
            object.rotate_mode = false;
        }
        else if(event.type === me.ui.touch.eventNames["move"]) {
            if(!object.rotate_mode && event.clientX > object.rotate_left - 30 && event.clientX < object.rotate_left + 30) {
                return;
            }
            object.rotate_mode = true;
            var target_region = me.ui.rect.absoluteRegion(object);
            var x = 0, y = 0, z = 0, a = 0;
            a = event.clientX - target_region.left + "deg";
            y = event.clientY - target_region.top;
            me.core.property.set(object, "ui.style.transform", "rotate3d(" + [x,y,z,a].join(",") + ")");
        }
        else if(event.type === me.ui.touch.eventNames["up"]) {
            object.rotate_mode = false;
            me.core.property.set(object, {
                "ui.touch.move": null,
                "ui.touch.up": null
            });
        }
    };
};
