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
        var window = me.ui.element.create(json, parent, "self", params);
        window.language = "english";
        return window;
    };
    me.fullPath = function (name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.init = function () {
        me.core.property.set(me, {
            "core.property.object.path": null,
            "core.property.object.diagramData": null
        });
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
            window.options.clickCallback = "screens.widget.transform.openPopup";
        }
    };
    me.reload = {
        set: async function (object) {
            var window = me.widget.window.get(object);
            var path = me.core.property.get(window, "app.diagram.path");
            var diagramJson = await me.core.json.loadFile(path, false);
            me.core.property.set(window, "app.diagram.diagramData", diagramJson);
            me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
            me.core.property.notify(window, "app.diagram.refresh");
        }
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window.get(object);
            me.core.property.set(window.var.viewer, {
                "ui.basic.html": null,
                "ui.class.class": "app.diagram." + window.options.viewType.toLowerCase()
            });
            var diagramData = me.core.property.get(window, "app.diagram.diagramData");
            me.ui.element.create(diagramData.layers, window.var.viewer);
            if (diagramData.title) {
                me.core.property.set(window, "name", diagramData.title);
            }
            me.core.property.notify(window, "update");
        }
    };
};
