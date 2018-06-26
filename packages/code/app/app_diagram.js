/*
 @author Zakai Hamilton
 @component AppDiagram
 */

screens.app.diagram = function AppDiagram(me) {
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var path = me.fullPath(args[0]);
        var json = __json__;
        var options = null;
        var parent = "workspace";
        var params = null;
        var fullscreen = false;
        json["app.diagram.path"] = path;
        if (args.length > 1) {
            options = JSON.parse(JSON.stringify(args[1]));
            options.original = args[1];
        }
        if (args.length > 3) {
            parent = args[2] || "workspace";
            params = args[3];
            if (fullscreen) {
                json["widget.window.fullscreen"] = null;
            }
            json["ui.style.left"] = "0px";
            json["ui.style.top"] = "0px";
        }
        var window = me.ui.element(json, parent, "self", params);
        window.language = "english";
        return window;
    };
    me.fullPath = function (name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.init = function () {
        me.core.property.set(me, {
            "core.object.path": null,
            "core.object.diagramData": null
        });
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.mainWindow(object);
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
                    headings: true,
                    subHeadings: true,
                    language: "Auto",
                    fontSize: "18px",
                    phaseNumbers: true
                });
            }
            me.ui.options.choiceSet(me, null, "viewType", me.reload.set);
            me.ui.options.toggleSet(me, null, "doTranslation", me.reload.set);
            me.ui.options.toggleSet(me, null, "doExplanation", me.reload.set);
            me.ui.options.toggleSet(me, null, "prioritizeExplanation", me.reload.set);
            me.ui.options.toggleSet(me, null, "addStyles", me.reload.set);
            me.ui.options.toggleSet(me, null, "phaseNumbers", me.reload.set);
            me.ui.options.toggleSet(me, null, "keepSource", me.reload.set);
            me.ui.options.toggleSet(me, null, "abridged", me.reload.set);
            me.ui.options.choiceSet(me, null, "language", me.reload.set);
            me.ui.options.choiceSet(me, null, "fontSize", function (object, value, key, options) {
                me.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                me.core.property.notify(window, "reload");
                me.core.property.notify(window, "update");
            });
            me.ui.options.toggleSet(me, null, "pages", me.reload.set);
            me.ui.options.toggleSet(me, null, "columns", me.reload.set);
            me.ui.options.toggleSet(me, null, "headings", me.reload.set);
            me.ui.options.toggleSet(me, null, "subHeadings", me.reload.set);
            me.ui.class.useStylesheet("kab");
        }
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window(object);
            var path = me.core.property.get(window, "app.diagram.path");
            var diagramJson = await me.core.json.loadFile(path, false);
            me.core.property.set(window, "app.diagram.diagramData", diagramJson);
            me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
            me.core.property.notify(window, "app.diagram.refresh");
        }
    };
    me.term = {
        set: async function (object, text) {
            var window = me.widget.window(object);
            var array = text;
            if (!Array.isArray(text)) {
                array = [text];
            }
            var result = await me.core.util.map(array, async (text) => {
                var info = await me.kab.text.parse(window.language, text, window.options);
                return info.text;
            });
            me.core.property.set(object, "ui.basic.html", result.join("<br>"));
            me.core.property.notify(window, "update");
        }
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window(object);
            me.core.property.set(window.var.viewer, {
                "ui.basic.html": null,
                "ui.class.class": "app.diagram." + window.options.viewType.toLowerCase()
            });
            var diagramData = me.core.property.get(window, "app.diagram.diagramData");
            me.ui.element(diagramData.layers, window.var.viewer);
            if (diagramData.title) {
                me.core.property.set(window, "title", diagramData.title);
            }
            me.core.property.notify(window, "update");
        }
    };
};
