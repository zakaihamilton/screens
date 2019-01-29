/*
 @author Zakai Hamilton
 @component AppDiagram
 */

screens.app.diagram = function AppDiagram(me) {
    me.init = async function () {
        me.core.property.set(me, {
            "core.property.object.path": null,
            "core.property.object.diagramData": null
        });
        await me.ui.transform.attach(me);
    };
    me.launch = function (args) {
        if (!args) {
            args = [""];
        }
        var path = me.fullPath(args[0]);
        var json = __json__;
        var parent = "workspace";
        var params = null;
        json["app.diagram.path"] = path;
        if (args.length > 3) {
            parent = args[2] || "workspace";
            params = args[3];
            if (params && params.fullscreen) {
                json["widget.window.fullscreen"] = null;
            }
            json["ui.style.left"] = "0px";
            json["ui.style.top"] = "0px";
        }
        var window = me.ui.element.create(json, parent, "self", params);
        return window;
    };
    me.fullPath = function (name) {
        return "/packages/res/diagrams/" + name + ".json";
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            var options = me.transform.options();
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, Object.assign({
                    viewType: "Layers"
                }, options.load));
            }
            me.ui.options.toggleSet(me, null, Object.assign({}, options.toggle));
            me.ui.options.choiceSet(me, null, Object.assign({
                "viewType": me.reload,
                "fontSize": (object, value) => {
                    me.core.property.set(window.var.viewer, "ui.style.fontSize", value);
                    me.core.property.notify(window, "reload");
                    me.core.property.notify(window, "update");
                }
            }, options.choice));
            me.ui.class.useStylesheet("kab");
        }
    };
    me.reload = async function (object) {
        var window = me.widget.window.get(object);
        var path = me.core.property.get(window, "app.diagram.path");
        var diagramJson = await me.core.json.loadFile(path, false);
        me.core.property.set(window, "app.diagram.diagramData", diagramJson);
        me.core.property.set(window.var.viewer, "ui.style.fontSize", window.options.fontSize);
        me.core.property.notify(window, "app.diagram.refresh");
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
    me.term = async function (object, text) {
        var html = await me.transform.term(object, text);
        me.core.property.set(object, "ui.basic.html", html);
    };
};
