/*
 @author Zakai Hamilton
 @component AppDiagram
 */

package.app.diagram = function AppDiagram(me) {
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var path = me.fullPath(args[0]);
        var json = __json__;
        var options = null;
        var parent = "workspace";
        var fullscreen = false;
        json["app.diagram.path"] = path;
        if (args.length > 1) {
            options = JSON.parse(JSON.stringify(args[1]));
            options.original = args[1];
        }
        if (args.length > 3) {
            parent = args[2];
            fullscreen = args[3];
            if(fullscreen) {
                json["widget.window.fullscreen"] = null;
            }
            json["ui.style.left"] = "0px";
            json["ui.style.top"] = "0px";
            json["ui.node.moveToFirst"] = true;
            json["ui.style.breakInside"] = "avoid-column";
        }
        var window = me.ui.element.create(json, parent, "self");
        if (args.length > 3) {
            window.options = Object.assign({}, window.options, options);
            window.options = options;
            window.options.diagrams = false;
            window.options.reload = false;
            window.options.viewType = "Layers";
            window.options.doExplanation = false;
            window.options.headings = false;
            window.options.phaseNumbers = false;
            window.options.hoverCallback = null;
            window.optionsLoaded = true;
            me.core.property.set(window, "core.link.widget-window-restore", "app.diagram.restore");
        }
        window.language = "english";
        return window;
    };
    me.fullPath = function(name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.init = function () {
        me.path = me.core.object.property("app.diagram.path");
        me.diagramData = me.core.object.property("app.diagram.diagramData");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window(object);
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, {
                    viewType: "Layers",
                    doTranslation: true,
                    doExplanation: false,
                    prioritizeExplanation: false,
                    addStyles: true,
                    keepSource: false,
                    phaseNumbers: true,
                    headings: true,
                    fontSize: "22px"
                });
            }
            me.viewType = me.ui.options.choiceSet(me, "viewType", function (object, options, key, value) {
                var window = me.widget.window(object);
                me.core.property.notify(window, "app.diagram.reload");
            });
            me.doTranslation = me.ui.options.toggleSet(me, "doTranslation", me.reload.set);
            me.doExplanation = me.ui.options.toggleSet(me, "doExplanation", me.reload.set);
            me.prioritizeExplanation = me.ui.options.toggleSet(me, "prioritizeExplanation", me.reload.set);
            me.addStyles = me.ui.options.toggleSet(me, "addStyles", me.reload.set);
            me.phaseNumbers = me.ui.options.toggleSet(me, "phaseNumbers", me.reload.set);
            me.keepSource = me.ui.options.toggleSet(me, "keepSource", me.reload.set);
            me.headings = me.ui.options.toggleSet(me, "headings", me.reload.set);
            me.fontSize = me.ui.options.choiceSet(me, "fontSize", function (object, options, key, value) {
                var window = me.widget.window(object);
                me.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                me.core.property.notify(window, "reload");
                me.core.property.notify(window, "update");
            });
            me.ui.class.useStylesheet("kab");
        }
    };
    me.reload = {
        set: function (object) {
            var window = me.widget.window(object);
            var path = me.core.property.get(window, "app.diagram.path");
            me.core.json.loadFile(function (diagramJson) {
                me.core.property.set(window, "app.diagram.diagramData", diagramJson);
                me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
                me.core.property.notify(window, "app.diagram.refresh");
            }, path, false);
        }
    };
    me.term = {
        get: function (object, info) {
            if (object && info) {
                me.lock(info.task, task => {
                    var window = me.widget.window(object);
                    me.kab.text.parse(function (value) {
                        info.value = value;
                        me.unlock(task);
                    }, window.language, info.value, window.options);
                });
            }
        },
        set: function (object, text) {
            var window = me.widget.window(object);
            me.kab.text.parse(function (value) {
                me.core.property.set(object, "ui.basic.html", value);
                me.core.property.notify(window, "update");
            }, window.language, text, window.options);
        }
    };
    me.refresh = {
        set: function (object) {
            var window = me.widget.window(object);
            me.core.property.set(window.var.viewer, {
                "ui.basic.html":null,
                "ui.class.class": "app.diagram." + window.options.viewType.toLowerCase()
            });
            me.core.property.notify(window, "app.diagram.viewAs" + window.options.viewType);
            me.core.property.notify(window, "update");
        }
    };
    me.viewAsText = {
        set: function (object) {
            var window = me.widget.window(object);
            var diagramData = me.core.property.get(window, "app.diagram.diagramData");
            me.core.property.set(window.var.viewer, "ui.basic.text", JSON.stringify(diagramData, null, 4));
        }
    };
    me.viewAsLayers = {
        set: function (object) {
            var window = me.widget.window(object);
            var diagramData = me.core.property.get(window, "app.diagram.diagramData");
            me.ui.element.create(diagramData.layers, window.var.viewer);
            if (diagramData.title) {
                me.core.property.set(window, "title", diagramData.title);
            }
        }
    };
};
