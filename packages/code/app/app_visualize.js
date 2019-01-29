/*
 @author Zakai Hamilton
 @component AppVisualize
 */

screens.app.visualize = function AppVisualize(me) {
    me.init = async function () {
        await me.ui.transform.attach(me);
    };
    me.launch = function (args) {
        if (me.core.property.get(me.singleton, "ui.node.parent")) {
            me.core.property.set(me.singleton, "widget.window.close");
        }
        if (!args) {
            args = [""];
        }
        var json = __json__;
        var params = args[0];
        if (params && params.fullscreen) {
            json["widget.window.fullscreen"] = null;
        }
        var window = me.singleton = me.ui.element.create(json, "workspace", "self", params);
        return window;
    };
    me.initOptions = {
        set: function (object) {
            var window = me.widget.window.get(object);
            var options = me.transform.options();
            if (!window.optionsLoaded) {
                window.optionsLoaded = true;
                me.ui.options.load(me, window, Object.assign({
                }, options.load));
            }
            me.ui.options.toggleSet(me, null, Object.assign({}, options.toggle));
            me.ui.options.choiceSet(me, null, Object.assign({
                "fontSize": (object, value) => {
                    me.core.property.set(window.var.terms, "ui.style.fontSize", value);
                    me.core.property.notify(window, "update");
                }
            }, options.choice));
            me.ui.class.useStylesheet("kab");
            me.core.property.set(window.var.terms, "ui.style.fontSize", window.options.fontSize);
        }
    };
    me.term = async function (object, text) {
        var html = await me.transform.term(object, text);
        object.termText = text;
        me.core.property.set(object, "ui.basic.html", html);
    };
    me.reload = function (object) {
        var window = me.widget.window.get(object);
        var elements = me.ui.node.childList(window.var.terms);
        for (var element of elements) {
            me.core.property.set(element, "app.visualize.term", element.termText);
        }
    };
};
