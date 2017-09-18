/*
 @author Zakai Hamilton
 @component AppDiagram
 */

package.app.diagram = function AppDiagram(me) {
    me.launch = function (args) {
        var path = args[0];
        var json = __json__;
        json["app.diagram.path"] = path;
        var window = me.ui.element.create(json, "desktop", "self");
        me.notify(window, "app.viewer.reload");
    };
    me.init = function () {
        me.path = me.core.object.property("app.viewer.path");
        me.diagramData = me.core.object.property("app.viewer.diagramData");
        me.termData = me.core.object.property("app.viewer.termData");
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.window(object);
            me.ui.options.load(me, window, {
                viewType: "Text",
                doTranslation: true,
                doExplanation: false,
                prioritizeExplanation:false,
                addStyles: true,
                keepSource: false,
                phaseNumbers: true
            });
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
            me.ui.class.useStylesheet("kab.terms");
        }
    };
    me.reload = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var path = me.get(window, "app.diagram.path");
            me.core.json.loadFile(function(diagramJson) {
                me.set(window, "app.diagram.diagramData", diagramJson);
                me.kab.terms.setLanguage(function() {
                    me.kab.terms.retrieveTerms(function(terms) {
                        me.set(window, "app.diagram.termData", terms);
                        me.notify(window, "app.diagram.refresh");
                    }, "english", window.options);
                }, "english");
            }, path, false);
        }
    };
    me.style = {
        get: function(object, value) {
            var window = me.widget.window.window(object);
            var termData = me.get(window, "app.diagram.termData");
            var item = termData[value];
            if(item) {
                me.kab.style.process(value, item, )
            }
            else {
                return value;
            }
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
            var diagramData = me.get(window, "app.diagram.diagramData");
            var termData = me.get(window, "app.diagram.termData");
            me.set(window.var.viewer, "ui.basic.text", JSON.stringify(termData, null, 4));
        }
    };
    me.viewAsLayers = {
        set: function(object) {
            var window = me.widget.window.window(object);
            var diagramData = me.get(window, "app.diagram.diagramData");
            me.ui.element.create(diagramData.layers, window.var.viewer);
        }
    };
};
