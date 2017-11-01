/*
 @author Zakai Hamilton
 @component AppDiagram
 */

package.app.diagram = function AppDiagram(me) {
    me.launch = function (args) {
        if(!args) {
            args = [""];
        }
        var path = args[0];
        var json = __json__;
        var options = null;
        var parent = "workspace";
        json["app.diagram.path"] = path;
        if(args.length > 1) {
            options = JSON.parse(JSON.stringify(args[1]));
            options.original = args[1];
        }
        if(args.length > 2) {
            json["widget.window.embed"] = true;
            json["ui.style.left"] = "0px";
            json["ui.style.top"] = "0px";
            json["ui.style.width"] = "10em";
            json["ui.style.height"] = "10em";
            json["ui.node.moveToFirst"] = true;
            json["ui.style.breakInside"] = "avoid-column";
            parent = args[2];
        }
        var window = me.ui.element.create(json, parent, "self");
        if(args.length > 1) {
            window.options = options;
            window.options.diagrams = false;
            window.options.reload = false;
            window.options.fontSize = (parseInt(window.options.fontSize)/2) + "px";
            window.options.viewType = "Layers";
            window.options.doExplanation = false;
            window.options.headings = false;
            window.options.phaseNumbers = false;
            window.options.hoverCallback = null;
            window.optionsLoaded = true;
            me.set(window, "core.property.widget-window-restore", "app.diagram.restore");
        }
        window.language = "english";
        return window;
    };
    me.init = function () {
        me.path = me.core.object.property("app.viewer.path");
        me.diagramData = me.core.object.property("app.viewer.diagramData");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.ui.options.setStorage(me, window, "none");
            if(!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, {
                    viewType: "Layers",
                    doTranslation: true,
                    doExplanation: false,
                    prioritizeExplanation:false,
                    addStyles: true,
                    keepSource: false,
                    phaseNumbers: true,
                    headings: true,
                    fontSize: "22px"
                });
            }
            me.viewType = me.ui.options.choiceSet(me, "viewType", function (object, options, key, value) {
                var window = me.widget.window.window(object);
                me.notify(window, "app.diagram.reload");
            });
            me.doTranslation = me.ui.options.toggleSet(me, "doTranslation", me.reload.set);
            me.doExplanation = me.ui.options.toggleSet(me, "doExplanation", me.reload.set);
            me.prioritizeExplanation = me.ui.options.toggleSet(me, "prioritizeExplanation", me.reload.set);
            me.addStyles = me.ui.options.toggleSet(me, "addStyles", me.reload.set);
            me.phaseNumbers = me.ui.options.toggleSet(me, "phaseNumbers", me.reload.set);
            me.keepSource = me.ui.options.toggleSet(me, "keepSource", me.reload.set);
            me.headings = me.ui.options.toggleSet(me, "headings", me.reload.set);
            me.fontSize = me.ui.options.choiceSet(me, "fontSize", function (object, options, key, value) {
                var window = me.widget.window.window(object);
                me.set(window.var.viewer, "ui.style.fontSize", value);
                me.notify(window, "reload");
                me.notify(window, "update");
            });
            me.ui.class.useStylesheet("kab.term");
        }
    };
    me.reload = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.diagram.path");
            me.core.json.loadFile(function(diagramJson) {
                me.set(window, "app.diagram.diagramData", diagramJson);
                me.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
                me.notify(window, "app.diagram.refresh");
            }, path, false);
        }
    };
    me.term = {
        get: function(object, info) {
            if(object && info) {
                var task = me.core.job.begin(info.job);
                var window = me.widget.window.window(object);
                me.kab.text.parse(function(value) {
                    info.value = value;
                    me.core.job.end(task);
                }, window.language, info.value, window.options);
            }
        },
        set: function(object, text) {
            var window = me.widget.window.window(object);
            me.kab.text.parse(function(value) {
                me.set(object, "ui.basic.html", value);
                me.notify(window, "update");
            }, window.language, text, window.options);
        }
    };
    me.refresh = {
        set: function(object) {
            var window = me.widget.window.window(object);
            me.set(window.var.viewer, "ui.basic.html", null);
            me.set(window.var.viewer, "ui.class.class", "app.diagram." + window.options.viewType.toLowerCase());
            me.notify(window, "app.diagram.viewAs" + window.options.viewType);
            me.notify(window, "update");
        }
    };
    me.viewAsText = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var diagramData = me.get(window, "app.diagram.diagramData");
            me.set(window.var.viewer, "ui.basic.text", JSON.stringify(diagramData, null, 4));
        }
    };
    me.viewAsRelationships = {
        set: function(object) {
            var window = me.widget.window.window(object);
        }
    };
    me.viewAsLayers = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var diagramData = me.get(window, "app.diagram.diagramData");
            me.ui.element.create(diagramData.layers, window.var.viewer);
            if(diagramData.title) {
                me.set(window, "title", diagramData.title);
            }
        }
    };
    me.restore = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var embed = me.get(window, "embed");
            if(embed) {
                me.set(window, "app.diagram.fontSize", window.options.original.fontSize);
                me.set(window, "app.diagram.doExplanation", window.options.original.doExplanation);
                me.set(window, "app.diagram.phaseNumbers", window.options.original.phaseNumbers);
                me.set(window, "app.diagram.headings", window.options.original.headings);
            }
        }
    };
};
