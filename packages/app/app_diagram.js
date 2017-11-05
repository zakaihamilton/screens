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
        var window = me.the.ui.element.create(json, parent, "self");
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
            me.the.core.property.set(window, "core.property.widget-window-restore", "app.diagram.restore");
        }
        window.language = "english";
        return window;
    };
    me.init = function () {
        me.path = me.the.core.object.property("app.viewer.path");
        me.diagramData = me.the.core.object.property("app.viewer.diagramData");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.the.widget.window.window(object);
            me.the.ui.options.setStorage(me, window, "none");
            if(!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.the.ui.options.load(me, window, {
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
            me.viewType = me.the.ui.options.choiceSet(me, "viewType", function (object, options, key, value) {
                var window = me.the.widget.window.window(object);
                me.the.core.property.notify(window, "app.diagram.reload");
            });
            me.doTranslation = me.the.ui.options.toggleSet(me, "doTranslation", me.reload.set);
            me.doExplanation = me.the.ui.options.toggleSet(me, "doExplanation", me.reload.set);
            me.prioritizeExplanation = me.the.ui.options.toggleSet(me, "prioritizeExplanation", me.reload.set);
            me.addStyles = me.the.ui.options.toggleSet(me, "addStyles", me.reload.set);
            me.phaseNumbers = me.the.ui.options.toggleSet(me, "phaseNumbers", me.reload.set);
            me.keepSource = me.the.ui.options.toggleSet(me, "keepSource", me.reload.set);
            me.headings = me.the.ui.options.toggleSet(me, "headings", me.reload.set);
            me.fontSize = me.the.ui.options.choiceSet(me, "fontSize", function (object, options, key, value) {
                var window = me.the.widget.window.window(object);
                me.the.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                me.the.core.property.notify(window, "reload");
                me.the.core.property.notify(window, "update");
            });
            me.the.ui.class.useStylesheet("kab.term");
        }
    };
    me.reload = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var path = me.the.core.property.get(window, "app.diagram.path");
            me.the.core.json.loadFile(function(diagramJson) {
                me.the.core.property.set(window, "app.diagram.diagramData", diagramJson);
                me.the.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
                me.the.core.property.notify(window, "app.diagram.refresh");
            }, path, false);
        }
    };
    me.term = {
        get: function(object, info) {
            if(object && info) {
                var task = me.the.core.job.begin(info.job);
                var window = me.the.widget.window.window(object);
                me.the.kab.text.parse(function(value) {
                    info.value = value;
                    me.the.core.job.end(task);
                }, window.language, info.value, window.options);
            }
        },
        set: function(object, text) {
            var window = me.the.widget.window.window(object);
            me.the.kab.text.parse(function(value) {
                me.the.core.property.set(object, "ui.basic.html", value);
                me.the.core.property.notify(window, "update");
            }, window.language, text, window.options);
        }
    };
    me.refresh = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            me.the.core.property.set(window.var.viewer, "ui.basic.html", null);
            me.the.core.property.set(window.var.viewer, "ui.class.class", "app.diagram." + window.options.viewType.toLowerCase());
            me.the.core.property.notify(window, "app.diagram.viewAs" + window.options.viewType);
            me.the.core.property.notify(window, "update");
        }
    };
    me.viewAsText = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var diagramData = me.the.core.property.get(window, "app.diagram.diagramData");
            me.the.core.property.set(window.var.viewer, "ui.basic.text", JSON.stringify(diagramData, null, 4));
        }
    };
    me.viewAsRelationships = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
        }
    };
    me.viewAsLayers = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var diagramData = me.the.core.property.get(window, "app.diagram.diagramData");
            me.the.ui.element.create(diagramData.layers, window.var.viewer);
            if(diagramData.title) {
                me.the.core.property.set(window, "title", diagramData.title);
            }
        }
    };
    me.restore = {
        set: function(object) {
            var window = me.the.widget.window.window(object);
            var embed = me.the.core.property.get(window, "embed");
            if(embed) {
                me.the.core.property.set(window, "app.diagram.fontSize", window.options.original.fontSize);
                me.the.core.property.set(window, "app.diagram.doExplanation", window.options.original.doExplanation);
                me.the.core.property.set(window, "app.diagram.phaseNumbers", window.options.original.phaseNumbers);
                me.the.core.property.set(window, "app.diagram.headings", window.options.original.headings);
            }
        }
    };
};
